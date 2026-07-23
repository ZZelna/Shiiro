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
const SOLO_ANSWER_TIME_MS = 20_000;
const DUEL_CHALLENGE_TIMEOUT_MS = 60_000;
const DUEL_ROUND_TIME_MS = 15_000;
const DUEL_WIN_XP_BONUS = 20;

module.exports = {
  data: new SlashCommandBuilder()
    .setName('quiz')
    .setDescription('Commandes de quiz')
    .addSubcommand(sub =>
      sub.setName('solo')
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
        )
    )
    .addSubcommand(sub =>
      sub.setName('duel')
        .setDescription('Défie un autre joueur en 1v1 sur une série de questions')
        .addUserOption(option =>
          option.setName('adversaire').setDescription('Le joueur à défier').setRequired(true)
        )
        .addIntegerOption(option =>
          option.setName('manches').setDescription('Nombre de questions (défaut : 5)')
            .addChoices({ name: '3', value: 3 }, { name: '5', value: 5 }, { name: '10', value: 10 })
            .setRequired(false)
        )
    ),

  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();
    if (subcommand === 'solo') return executeSolo(interaction);
    if (subcommand === 'duel') return executeDuel(interaction);
  },
};

// =========================================================
// /quiz solo
// =========================================================
async function executeSolo(interaction) {
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
  const container = buildSoloQuestionContainer(question);
  container.addActionRowComponents(buttonRow);

  const message = await channel.send({
    flags: MessageFlags.IsComponentsV2,
    components: [container],
  });

  const collector = message.createMessageComponentCollector({
    componentType: ComponentType.Button,
    time: SOLO_ANSWER_TIME_MS,
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
    const revealedContainer = buildSoloQuestionContainer(question, { reveal: true });
    const disabledRow = buildAnswerRow(question, true);
    revealedContainer.addActionRowComponents(disabledRow);

    await message.edit({
      flags: MessageFlags.IsComponentsV2,
      components: [revealedContainer],
    }).catch(() => {});
  });
}

function buildSoloQuestionContainer(question, { reveal = false } = {}) {
  const container = new ContainerBuilder().setAccentColor(0x5865F2);

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(`### 🧠 Quiz — ${question.category} (${question.difficulty})`)
  );
  container.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small));
  container.addTextDisplayComponents(new TextDisplayBuilder().setContent(question.question));
  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(`-# ${question.points} points • ${SOLO_ANSWER_TIME_MS / 1000}s pour répondre`)
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

// =========================================================
// /quiz duel
// =========================================================
async function executeDuel(interaction) {
  const opponent = interaction.options.getUser('adversaire');
  const rounds = interaction.options.getInteger('manches') ?? 5;

  if (opponent.id === interaction.user.id) {
    return interaction.reply({ content: '❌ Tu ne peux pas te défier toi-même.', ephemeral: true });
  }
  if (opponent.bot) {
    return interaction.reply({ content: '❌ Tu ne peux pas défier un bot.', ephemeral: true });
  }

  const config = await GuildConfig.findOne({ guildId: interaction.guild.id });
  const channelId = config?.channels?.duel;
  if (!channelId) {
    return interaction.reply({
      content: "❌ Le salon duel n'est pas configuré. Un admin doit d'abord utiliser `/setup-arene`.",
      ephemeral: true,
    });
  }
  const channel = await interaction.guild.channels.fetch(channelId).catch(() => null);
  if (!channel) {
    return interaction.reply({ content: '❌ Le salon duel est introuvable.', ephemeral: true });
  }

  await interaction.reply({ content: `⚔️ Défi envoyé à ${opponent} dans ${channel} !`, ephemeral: true });

  // --- Étape 1 : invitation ---
  const buildInviteContainer = (statusLine, rowComponents) => {
    const c = new ContainerBuilder().setAccentColor(0xED4245);
    c.addTextDisplayComponents(new TextDisplayBuilder().setContent(`### ⚔️ Défi lancé !`));
    c.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `${interaction.user} défie ${opponent} en duel (${rounds} questions) !\n${opponent}, acceptes-tu ?`
      )
    );
    if (statusLine) {
      c.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small));
      c.addTextDisplayComponents(new TextDisplayBuilder().setContent(statusLine));
    }
    if (rowComponents) c.addActionRowComponents(rowComponents);
    return c;
  };

  const inviteRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('duel_accept').setLabel('Accepter').setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId('duel_decline').setLabel('Refuser').setStyle(ButtonStyle.Danger),
  );

  const inviteMessage = await channel.send({
    content: `${opponent}`,
    flags: MessageFlags.IsComponentsV2,
    components: [buildInviteContainer(null, inviteRow)],
  });

  let accepted;
  try {
    const response = await inviteMessage.awaitMessageComponent({
      componentType: ComponentType.Button,
      time: DUEL_CHALLENGE_TIMEOUT_MS,
      filter: i => i.user.id === opponent.id,
    });
    accepted = response.customId === 'duel_accept';
    await response.deferUpdate();
  } catch {
    accepted = null; // timeout
  }

  const disabledInviteRow = new ActionRowBuilder().addComponents(
    ButtonBuilder.from(inviteRow.components[0]).setDisabled(true),
    ButtonBuilder.from(inviteRow.components[1]).setDisabled(true),
  );

  if (!accepted) {
    return inviteMessage.edit({
      flags: MessageFlags.IsComponentsV2,
      components: [buildInviteContainer('⌛ Défi expiré, sans réponse.', disabledInviteRow)],
    });
  }

  if (accepted === false) {
    return inviteMessage.edit({
      flags: MessageFlags.IsComponentsV2,
      components: [buildInviteContainer(`❌ ${opponent} a refusé le duel.`, disabledInviteRow)],
    });
  }

  await inviteMessage.edit({
    flags: MessageFlags.IsComponentsV2,
    components: [buildInviteContainer('✅ Défi accepté ! Ça commence...', disabledInviteRow)],
  });

  // --- Étape 2 : les manches ---
  const players = [interaction.user, opponent];
  const scores = { [interaction.user.id]: 0, [opponent.id]: 0 };
  const correctCounts = { [interaction.user.id]: 0, [opponent.id]: 0 };

  for (let round = 1; round <= rounds; round++) {
    const question = pickQuestion({});
    if (!question) break;

    const row = new ActionRowBuilder().addComponents(
      question.choices.map((choice, i) =>
        new ButtonBuilder()
          .setCustomId(`duelans_${i}`)
          .setLabel(`${LETTERS[i]}. ${choice}`)
          .setStyle(ButtonStyle.Secondary)
      )
    );

    const container = new ContainerBuilder().setAccentColor(0xED4245);
    container.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`### ⚔️ Duel — Manche ${round}/${rounds}`)
    );
    container.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small));
    container.addTextDisplayComponents(new TextDisplayBuilder().setContent(question.question));
    container.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`-# Premier à trouver la bonne réponse marque le point • ${DUEL_ROUND_TIME_MS / 1000}s`)
    );
    container.addActionRowComponents(row);

    const roundMessage = await channel.send({ flags: MessageFlags.IsComponentsV2, components: [container] });

    const wrongAnswered = new Set();
    let winnerId = null;

    const collector = roundMessage.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: DUEL_ROUND_TIME_MS,
      filter: i => players.some(p => p.id === i.user.id),
    });

    await new Promise(resolve => {
      collector.on('collect', async i => {
        if (wrongAnswered.has(i.user.id)) {
          return i.reply({ content: 'Tu as déjà répondu à cette manche.', ephemeral: true });
        }
        const isCorrect = Number(i.customId.split('_')[1]) === question.answer;
        if (isCorrect) {
          winnerId = i.user.id;
          scores[winnerId] += question.points;
          correctCounts[winnerId] += 1;
          await i.reply({ content: `✅ Bonne réponse ! +${question.points} points`, ephemeral: true });
          collector.stop('answered');
        } else {
          wrongAnswered.add(i.user.id);
          await i.reply({ content: '❌ Mauvaise réponse.', ephemeral: true });
        }
      });

      collector.on('end', () => resolve());
    });

    const disabledRow = new ActionRowBuilder().addComponents(
      row.components.map(btn => ButtonBuilder.from(btn).setDisabled(true))
    );
    const winnerText = winnerId
      ? `🏆 <@${winnerId}> a trouvé en premier !`
      : "😶 Personne n'a trouvé.";

    const revealContainer = new ContainerBuilder().setAccentColor(0xED4245);
    revealContainer.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`### ⚔️ Duel — Manche ${round}/${rounds}`)
    );
    revealContainer.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small));
    revealContainer.addTextDisplayComponents(new TextDisplayBuilder().setContent(question.question));
    revealContainer.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small));
    revealContainer.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `✅ **Bonne réponse : ${question.choices[question.answer]}**\n${winnerText}`
      )
    );
    revealContainer.addActionRowComponents(disabledRow);

    await roundMessage.edit({ flags: MessageFlags.IsComponentsV2, components: [revealContainer] }).catch(() => {});
  }

  // --- Étape 3 : résultat final ---
  const [p1, p2] = players;
  const p1Score = scores[p1.id];
  const p2Score = scores[p2.id];
  let resultText;
  let winner = null;

  if (p1Score === p2Score) {
    resultText = `🤝 Égalité parfaite ! ${p1Score} - ${p2Score}`;
  } else {
    winner = p1Score > p2Score ? p1 : p2;
    const loser = winner.id === p1.id ? p2 : p1;
    resultText = `🏆 ${winner} remporte le duel ! (${Math.max(p1Score, p2Score)} - ${Math.min(p1Score, p2Score)})\n${loser} peut prendre sa revanche à tout moment.`;
  }

  for (const player of players) {
    const profile = await getOrCreateProfile(player.id, interaction.guild.id);
    let xpGain = correctCounts[player.id] > 0 ? scores[player.id] : 0;
    if (winner && winner.id === player.id) xpGain += DUEL_WIN_XP_BONUS;
    profile.xp += xpGain;
    profile.level = levelFromXp(profile.xp);
    profile.questionsAnswered += rounds;
    profile.questionsCorrect += correctCounts[player.id];
    profile.lastPlayedAt = new Date();
    await profile.save();
  }

  const finalContainer = new ContainerBuilder().setAccentColor(0x57F287);
  finalContainer.addTextDisplayComponents(new TextDisplayBuilder().setContent('### 🏁 Fin du duel'));
  finalContainer.addTextDisplayComponents(new TextDisplayBuilder().setContent(resultText));

  await channel.send({ flags: MessageFlags.IsComponentsV2, components: [finalContainer] });
}

// =========================================================
// Partagé
// =========================================================
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
