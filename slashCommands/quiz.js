const {
  SlashCommandBuilder,
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
  MessageFlags,
} = require('discord.js');
const GuildConfig = require('../models/GuildConfig');
const QuizProfile = require('../models/QuizProfile');
const { pickQuestion, computeXpGain, levelFromXp } = require('../utils/quizEngine');

const LETTERS = ['A', 'B', 'C', 'D'];
const ANSWER_TIME_MS = 20_000;

module.exports = {
  data: new SlashCommandBuilder()
    .setName('quiz')
    .setDescription('Lance une question de quiz en solo')
    .addStringOption(option =>
      option.setName('categorie').setDescription('Filtrer par catégorie').setRequired(false)
    )
    .addStringOption(option =>
      option.setName('difficulte').setDescription('Filtrer par difficulté')
        .addChoices(
          { name: 'facile', value: 'easy' },
          { name: 'moyen', value: 'medium' },
          { name: 'difficile', value: 'hard' },
        )
        .setRequired(false)
    ),

  async execute(interaction) {
    const config = await GuildConfig.findOne({ guildId: interaction.guild.id });
    if (!config || !config.channels?.quizSolo) {
      return interaction.reply({
        content: "❌ Le salon quiz-solo n'est pas configuré. Un admin doit d'abord utiliser `/setup-arene`.",
        ephemeral: true,
      });
    }

    const channel = await interaction.guild.channels.fetch(config.channels.quizSolo).catch(() => null);
    if (!channel) {
      return interaction.reply({
        content: "❌ Le salon quiz-solo est introuvable. Relance `/setup-arene`.",
        ephemeral: true,
      });
    }

    const question = pickQuestion({
      category: interaction.options.getString('categorie'),
      difficulty: interaction.options.getString('difficulte'),
    });

    if (!question) {
      return interaction.reply({ content: "❌ Aucune question ne correspond à ces filtres.", ephemeral: true });
    }

    await interaction.reply({ content: `🎲 Question envoyée dans ${channel} !`, ephemeral: true });

    const buttonRow = buildAnswerRow(question, false);
    const container = buildQuestionContainer(question);

    const message = await channel.send({
      flags: MessageFlags.IsComponentsV2,
      components: [container, buttonRow],
    });

    const collector = message.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: ANSWER_TIME_MS,
    });

    const answered = new Set();

    collector.on('collect', async i => {
      if (answered.has(i.user.id)) {
        return i.reply({ content: 'Tu as déjà répondu à cette question.', ephemeral: true });
      }
      answered.add(i.user.id);

      const isCorrect = Number(i.customId.split('_')[1]) === question.answer;
      const profile = await getOrCreateProfile(i.user.id, i.guild.id);

      if (isCorrect) {
        const newStreak = profile.streak + 1;
        const xpGain = computeXpGain(question, newStreak);
        const newXp = profile.xp + xpGain;
        const oldLevel = profile.level;
        const newLevel = levelFromXp(newXp);

        profile.xp = newXp;
        profile.level = newLevel;
        profile.streak = newStreak;
        profile.bestStreak = Math.max(profile.bestStreak, newStreak);
        profile.questionsAnswered += 1;
        profile.questionsCorrect += 1;
        profile.lastPlayedAt = new Date();
        await profile.save();

        let reply = `✅ Bonne réponse ! +${xpGain} XP (streak x${newStreak})`;
        if (newLevel > oldLevel) reply += `\n🎉 Niveau supérieur ! Tu passes niveau **${newLevel}**.`;

        await i.reply({ content: reply, ephemeral: true });
      } else {
        profile.streak = 0;
        profile.questionsAnswered += 1;
        profile.lastPlayedAt = new Date();
        await profile.save();

        await i.reply({
          content: `❌ Mauvaise réponse. La bonne réponse était : **${question.choices[question.answer]}**`,
          ephemeral: true,
        });
      }
    });

    collector.on('end', async () => {
      const revealedContainer = buildQuestionContainer(question, { reveal: true });
      const disabledRow = buildAnswerRow(question, true);

      await message.edit({
        flags: MessageFlags.IsComponentsV2,
        components: [revealedContainer, disabledRow],
      }).catch(() => {});
    });
  },
};

/**
 * Construit le Container V2 affichant l'énoncé (et l'explication une fois révélée)
 */
function buildQuestionContainer(question, { reveal = false } = {}) {
  const container = new ContainerBuilder().setAccentColor(0x5865F2);

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(`### 🧠 Quiz — ${question.category} (${question.difficulty})`)
  );
  container.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small));
  container.addTextDisplayComponents(new TextDisplayBuilder().setContent(question.question));
  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(`-# ${question.points} points • ${ANSWER_TIME_MS / 1000}s pour répondre`)
  );

  if (reveal) {
    container.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small));
    const revealText = question.explanation
      ? `✅ **Bonne réponse : ${question.choices[question.answer]}**\n💡 ${question.explanation}`
      : `✅ **Bonne réponse : ${question.choices[question.answer]}**`;
    container.addTextDisplayComponents(new TextDisplayBuilder().setContent(revealText));
  }

  return container;
}

/**
 * Construit la rangée des 4 boutons de réponse
 */
function buildAnswerRow(question, disabled) {
  return new ActionRowBuilder().addComponents(
    question.choices.map((choice, i) =>
      new ButtonBuilder()
        .setCustomId(`quiz_${i}`)
        .setLabel(`${LETTERS[i]}. ${choice}`)
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(disabled)
    )
  );
}

async function getOrCreateProfile(userId, guildId) {
  let profile = await QuizProfile.findOne({ userId, guildId });
  if (!profile) {
    profile = await QuizProfile.create({ userId, guildId });
  }
  return profile;
}
