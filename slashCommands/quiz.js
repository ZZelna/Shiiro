const {
  SlashCommandBuilder,
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  SectionBuilder,
  ThumbnailBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
  MessageFlags,
} = require('discord.js');
const GuildConfig = require('../models/GuildConfig');
const QuizProfile = require('../models/QuizProfile');
const PrestigeConfig = require('../models/PrestigeConfig');
const CasinoProfile = require('../models/CasinoProfile');
const { pickQuestion, computeXpGain, levelFromXp, xpForLevel } = require('../utils/quizEngine');

const PRESTIGE_LEVEL_REQUIRED = 100;
const PRESTIGE_TIERS = [
  { name: 'Prestige I', badge: '🥉 Badge Prestige I', frame: 'Cadre Bronze', title: null, extra: null, yens: 50_000 },
  { name: 'Prestige II', badge: '🥈 Badge Prestige II', frame: 'Cadre Argent', title: 'Titre exclusif', extra: null, yens: 100_000 },
  { name: 'Prestige III', badge: '🥇 Badge Prestige III', frame: 'Cadre Or', title: null, extra: '1 drop', yens: 200_000 },
  { name: 'Prestige IV', badge: '💠 Badge Prestige IV', frame: 'Cadre Platine', title: null, extra: 'Bannière de profil', yens: 300_000 },
  { name: 'Prestige V', badge: '💎 Badge Prestige V', frame: 'Cadre Diamant', title: null, extra: 'Mascotte exclusive', yens: 500_000 },
  { name: 'Prestige VI', badge: '🔷 Badge Prestige VI', frame: null, title: 'Titre rare', extra: 'Effet de profil', yens: 750_000 },
  { name: 'Prestige VII', badge: '🟢 Badge Prestige VII', frame: 'Cadre Émeraude', title: null, extra: '2 drops', yens: 1_000_000 },
  { name: 'Prestige VIII', badge: '🔮 Badge Prestige VIII', frame: 'Cadre Améthyste animé', title: null, extra: 'Bannière animée', yens: 1_500_000 },
  { name: 'Prestige IX', badge: '🌌 Badge Prestige IX', frame: 'Cadre Cosmique', title: null, extra: 'Aura de profil', yens: 2_000_000 },
  { name: 'Prestige X', badge: '👑 Badge Mythique', frame: 'Cadre Mythique animé', title: 'Le Légendaire', extra: 'Hall of Fame', yens: 5_000_000 },
];

const LETTERS = ['A', 'B', 'C', 'D'];
const SOLO_ANSWER_TIME_MS = 20_000;
const DUEL_CHALLENGE_TIMEOUT_MS = 60_000;
const DUEL_ROUND_TIME_MS = 15_000;
const DUEL_WIN_XP_BONUS = 20;
const DUO_CHALLENGE_TIMEOUT_MS = 90_000;
const DUO_ROUND_TIME_MS = 20_000;
const DUO_TEAM_WIN_XP_BONUS = 15;

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
    )
    .addSubcommand(sub =>
      sub.setName('duo2v2')
        .setDescription('Défie une autre équipe de 2 en 2v2')
        .addUserOption(option =>
          option.setName('coequipier').setDescription('Ton coéquipier').setRequired(true)
        )
        .addUserOption(option =>
          option.setName('adversaire1').setDescription('Premier adversaire').setRequired(true)
        )
        .addUserOption(option =>
          option.setName('adversaire2').setDescription('Second adversaire').setRequired(true)
        )
        .addIntegerOption(option =>
          option.setName('manches').setDescription('Nombre de questions (défaut : 5)')
            .addChoices({ name: '3', value: 3 }, { name: '5', value: 5 }, { name: '10', value: 10 })
            .setRequired(false)
        )
    )
    .addSubcommand(sub =>
      sub.setName('profil')
        .setDescription('Affiche ton profil de quiz (XP, niveau, streak)')
        .addUserOption(option =>
          option.setName('joueur').setDescription("Voir le profil d'un autre joueur").setRequired(false)
        )
    )
    .addSubcommand(sub =>
      sub.setName('prestige')
        .setDescription(`Passe au palier de prestige suivant (niveau ${PRESTIGE_LEVEL_REQUIRED} requis)`)
    ),

  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();
    if (subcommand === 'solo') return executeSolo(interaction);
    if (subcommand === 'duel') return executeDuel(interaction);
    if (subcommand === 'duo2v2') return executeDuo2v2(interaction);
    if (subcommand === 'profil') return executeProfil(interaction);
    if (subcommand === 'prestige') return executePrestige(interaction);
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
// /quiz duo2v2
// =========================================================
async function executeDuo2v2(interaction) {
  const teammate = interaction.options.getUser('coequipier');
  const opp1 = interaction.options.getUser('adversaire1');
  const opp2 = interaction.options.getUser('adversaire2');
  const rounds = interaction.options.getInteger('manches') ?? 5;

  const teamA = [interaction.user, teammate];
  const teamB = [opp1, opp2];
  const allPlayers = [...teamA, ...teamB];

  const ids = allPlayers.map(p => p.id);
  if (new Set(ids).size !== 4) {
    return interaction.reply({ content: '❌ Les 4 joueurs doivent être distincts.', ephemeral: true });
  }
  if (allPlayers.some(p => p.bot)) {
    return interaction.reply({ content: '❌ Aucun des 4 joueurs ne peut être un bot.', ephemeral: true });
  }

  const config = await GuildConfig.findOne({ guildId: interaction.guild.id });
  const channelId = config?.channels?.duo2v2;
  if (!channelId) {
    return interaction.reply({
      content: "❌ Le salon duo-2v2 n'est pas configuré. Un admin doit d'abord utiliser `/setup-arene`.",
      ephemeral: true,
    });
  }
  const channel = await interaction.guild.channels.fetch(channelId).catch(() => null);
  if (!channel) {
    return interaction.reply({ content: '❌ Le salon duo-2v2 est introuvable.', ephemeral: true });
  }

  await interaction.reply({ content: `👥 Défi 2v2 envoyé dans ${channel} !`, ephemeral: true });

  // --- Étape 1 : invitation (les 3 autres joueurs doivent accepter) ---
  const toConfirm = [teammate, opp1, opp2];
  const confirmedIds = new Set();

  const buildInviteContainer = (statusLine, rowComponents) => {
    const c = new ContainerBuilder().setAccentColor(0x5865F2);
    c.addTextDisplayComponents(new TextDisplayBuilder().setContent('### 👥 Défi 2v2 lancé !'));
    c.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `**Équipe A** : ${teamA.join(' & ')}\n**Équipe B** : ${teamB.join(' & ')}\n` +
        `(${rounds} questions)\n\n${teammate}, ${opp1}, ${opp2} — cliquez sur Accepter pour confirmer votre présence.`
      )
    );
    c.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small));
    c.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `✅ Confirmé(s) : ${confirmedIds.size ? [...confirmedIds].map(id => `<@${id}>`).join(', ') : 'aucun'}`
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
    new ButtonBuilder().setCustomId('duo_accept').setLabel('Accepter').setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId('duo_decline').setLabel('Refuser').setStyle(ButtonStyle.Danger),
  );

  const inviteMessage = await channel.send({
    flags: MessageFlags.IsComponentsV2,
    components: [buildInviteContainer(null, inviteRow)],
  });

  const disabledInviteRow = new ActionRowBuilder().addComponents(
    ButtonBuilder.from(inviteRow.components[0]).setDisabled(true),
    ButtonBuilder.from(inviteRow.components[1]).setDisabled(true),
  );

  const outcome = await new Promise(resolve => {
    const collector = inviteMessage.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: DUO_CHALLENGE_TIMEOUT_MS,
      filter: i => toConfirm.some(p => p.id === i.user.id),
    });

    collector.on('collect', async i => {
      if (i.customId === 'duo_decline') {
        await i.reply({ content: 'Défi refusé.', ephemeral: true });
        collector.stop('declined');
        return;
      }
      confirmedIds.add(i.user.id);
      await i.update({ flags: MessageFlags.IsComponentsV2, components: [buildInviteContainer(null, inviteRow)] });
      if (confirmedIds.size === 3) collector.stop('confirmed');
    });

    collector.on('end', (_collected, reason) => resolve(reason));
  });

  if (outcome !== 'confirmed') {
    const statusLine = outcome === 'declined' ? '❌ Un des joueurs a refusé le défi.' : '⌛ Défi expiré, tout le monde n\'a pas confirmé.';
    return inviteMessage.edit({
      flags: MessageFlags.IsComponentsV2,
      components: [buildInviteContainer(statusLine, disabledInviteRow)],
    });
  }

  await inviteMessage.edit({
    flags: MessageFlags.IsComponentsV2,
    components: [buildInviteContainer('✅ Tout le monde a confirmé ! Ça commence...', disabledInviteRow)],
  });

  // --- Étape 2 : les manches ---
  const teamScores = { A: 0, B: 0 };
  const playerScores = Object.fromEntries(allPlayers.map(p => [p.id, 0]));
  const playerCorrect = Object.fromEntries(allPlayers.map(p => [p.id, 0]));
  const teamOf = id => (teamA.some(p => p.id === id) ? 'A' : 'B');

  for (let round = 1; round <= rounds; round++) {
    const question = pickQuestion({});
    if (!question) break;

    const row = new ActionRowBuilder().addComponents(
      question.choices.map((choice, i) =>
        new ButtonBuilder()
          .setCustomId(`duoans_${i}`)
          .setLabel(`${LETTERS[i]}. ${choice}`)
          .setStyle(ButtonStyle.Secondary)
      )
    );

    const container = new ContainerBuilder().setAccentColor(0x5865F2);
    container.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`### 👥 2v2 — Manche ${round}/${rounds}`)
    );
    container.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small));
    container.addTextDisplayComponents(new TextDisplayBuilder().setContent(question.question));
    container.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `-# Chacun répond pour son équipe • ${question.points} points • ${DUO_ROUND_TIME_MS / 1000}s`
      )
    );
    container.addActionRowComponents(row);

    const roundMessage = await channel.send({ flags: MessageFlags.IsComponentsV2, components: [container] });

    const answered = new Set();
    const roundCorrect = [];

    const collector = roundMessage.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: DUO_ROUND_TIME_MS,
      filter: i => allPlayers.some(p => p.id === i.user.id),
    });

    await new Promise(resolve => {
      collector.on('collect', async i => {
        if (answered.has(i.user.id)) {
          return i.reply({ content: 'Tu as déjà répondu à cette manche.', ephemeral: true });
        }
        answered.add(i.user.id);

        const isCorrect = Number(i.customId.split('_')[1]) === question.answer;
        if (isCorrect) {
          const team = teamOf(i.user.id);
          teamScores[team] += question.points;
          playerScores[i.user.id] += question.points;
          playerCorrect[i.user.id] += 1;
          roundCorrect.push(i.user.id);
          await i.reply({ content: `✅ Bonne réponse ! +${question.points} points pour l'équipe ${team}`, ephemeral: true });
        } else {
          await i.reply({ content: '❌ Mauvaise réponse.', ephemeral: true });
        }
      });

      collector.on('end', () => resolve());
    });

    const disabledRow = new ActionRowBuilder().addComponents(
      row.components.map(btn => ButtonBuilder.from(btn).setDisabled(true))
    );
    const foundText = roundCorrect.length
      ? `🎯 Ont trouvé : ${roundCorrect.map(id => `<@${id}>`).join(', ')}`
      : "😶 Personne n'a trouvé.";

    const revealContainer = new ContainerBuilder().setAccentColor(0x5865F2);
    revealContainer.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`### 👥 2v2 — Manche ${round}/${rounds}`)
    );
    revealContainer.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small));
    revealContainer.addTextDisplayComponents(new TextDisplayBuilder().setContent(question.question));
    revealContainer.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small));
    revealContainer.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `✅ **Bonne réponse : ${question.choices[question.answer]}**\n${foundText}\n` +
        `📊 Score actuel — Équipe A : **${teamScores.A}** • Équipe B : **${teamScores.B}**`
      )
    );
    revealContainer.addActionRowComponents(disabledRow);

    await roundMessage.edit({ flags: MessageFlags.IsComponentsV2, components: [revealContainer] }).catch(() => {});
  }

  // --- Étape 3 : résultat final ---
  let resultText;
  let winningTeam = null;

  if (teamScores.A === teamScores.B) {
    resultText = `🤝 Égalité parfaite ! Équipe A ${teamScores.A} - ${teamScores.B} Équipe B`;
  } else {
    winningTeam = teamScores.A > teamScores.B ? teamA : teamB;
    const label = teamScores.A > teamScores.B ? 'A' : 'B';
    resultText = `🏆 L'équipe ${label} (${winningTeam.join(' & ')}) remporte le 2v2 ! ` +
      `(${Math.max(teamScores.A, teamScores.B)} - ${Math.min(teamScores.A, teamScores.B)})`;
  }

  for (const player of allPlayers) {
    const profile = await getOrCreateProfile(player.id, interaction.guild.id);
    let xpGain = playerScores[player.id];
    if (winningTeam && winningTeam.some(p => p.id === player.id)) xpGain += DUO_TEAM_WIN_XP_BONUS;
    profile.xp += xpGain;
    profile.level = levelFromXp(profile.xp);
    profile.questionsAnswered += rounds;
    profile.questionsCorrect += playerCorrect[player.id];
    profile.lastPlayedAt = new Date();
    await profile.save();
  }

  const finalContainer = new ContainerBuilder().setAccentColor(0x57F287);
  finalContainer.addTextDisplayComponents(new TextDisplayBuilder().setContent('### 🏁 Fin du 2v2'));
  finalContainer.addTextDisplayComponents(new TextDisplayBuilder().setContent(resultText));

  await channel.send({ flags: MessageFlags.IsComponentsV2, components: [finalContainer] });
}

// =========================================================
// /quiz profil
// =========================================================
async function executeProfil(interaction) {
  const target = interaction.options.getUser('joueur') ?? interaction.user;

  const profile = await QuizProfile.findOne({ userId: target.id, guildId: interaction.guild.id });
  if (!profile) {
    const msg = target.id === interaction.user.id
      ? "❌ Tu n'as pas encore de profil de quiz. Lance `/quiz solo` pour commencer !"
      : `❌ ${target.username} n'a pas encore de profil de quiz.`;
    return interaction.reply({ content: msg, ephemeral: true });
  }

  const xpAtLevel = xpForLevel(profile.level);
  const xpNextLevel = xpForLevel(profile.level + 1);
  const progress = profile.xp - xpAtLevel;
  const span = xpNextLevel - xpAtLevel;
  const bar = buildProgressBar(progress, span);
  const accuracy = profile.questionsAnswered > 0
    ? Math.round((profile.questionsCorrect / profile.questionsAnswered) * 100)
    : 0;

  const section = new SectionBuilder()
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`### 🧠 Profil quiz de ${target.username}`)
    )
    .setThumbnailAccessory(
      new ThumbnailBuilder().setURL(target.displayAvatarURL())
    );

  const container = new ContainerBuilder().setAccentColor(0x5865F2);
  container.addSectionComponents(section);
  container.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small));
  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(
      `**🏅 Niveau ${profile.level}**\n${bar}  ${progress}/${span} XP  •  ${profile.xp} XP au total`
    )
  );
  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(
      `**🔥 Streak actuel :** ${profile.streak}  •  **Meilleur streak :** ${profile.bestStreak}`
    )
  );
  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(
      `**📊 Stats :** ${profile.questionsCorrect}/${profile.questionsAnswered} bonnes réponses (${accuracy}%)`
    )
  );

  if (profile.prestige > 0) {
    const tierName = PRESTIGE_TIERS[profile.prestige - 1]?.name ?? `Prestige ${profile.prestige}`;
    const badges = profile.badges.length ? profile.badges.join(' ') : '_aucun_';
    const extras = [
      profile.title ? `🎖️ Titre : **${profile.title}**` : null,
      profile.frame ? `🖼️ Cadre : **${profile.frame}**` : null,
      profile.pendingDrops > 0 ? `🎁 Drops en attente : **${profile.pendingDrops}**` : null,
    ].filter(Boolean).join('  •  ');

    container.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small));
    container.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `**👑 ${tierName}**\n${badges}` + (extras ? `\n${extras}` : '')
      )
    );
  }

  await interaction.reply({ flags: MessageFlags.IsComponentsV2, components: [container] });
}

function buildProgressBar(current, total, length = 12) {
  const ratio = total > 0 ? Math.min(Math.max(current / total, 0), 1) : 0;
  const filled = Math.round(ratio * length);
  return '█'.repeat(filled) + '░'.repeat(length - filled);
}

// =========================================================
// /quiz prestige
// =========================================================
async function executePrestige(interaction) {
  const profile = await QuizProfile.findOne({ userId: interaction.user.id, guildId: interaction.guild.id });

  if (!profile) {
    return interaction.reply({
      content: "❌ Tu n'as pas encore de profil de quiz. Lance `/quiz solo` pour commencer !",
      ephemeral: true,
    });
  }

  if (profile.prestige >= PRESTIGE_TIERS.length) {
    return interaction.reply({
      content: `👑 Tu as déjà atteint le prestige maximum (**${PRESTIGE_TIERS[PRESTIGE_TIERS.length - 1].name}**).`,
      ephemeral: true,
    });
  }

  if (profile.level < PRESTIGE_LEVEL_REQUIRED) {
    return interaction.reply({
      content: `❌ Tu dois atteindre le niveau **${PRESTIGE_LEVEL_REQUIRED}** avant de pouvoir prestige (actuellement niveau ${profile.level}).`,
      ephemeral: true,
    });
  }

  const nextTierIndex = profile.prestige; // prestige=0 -> tier index 0 (Prestige I)
  const tier = PRESTIGE_TIERS[nextTierIndex];

  // --- Mise à jour du profil ---
  profile.prestige = nextTierIndex + 1;
  profile.xp = 0;
  profile.level = 1;
  profile.badges.push(tier.badge);
  if (tier.title) profile.title = tier.title;
  if (tier.frame) profile.frame = tier.frame;
  if (tier.extra && tier.extra.includes('drop')) {
    const count = parseInt(tier.extra, 10) || 1;
    profile.pendingDrops += count;
  }
  await profile.save();

  // --- Récompense en Yens (crée le profil casino si besoin) ---
  await CasinoProfile.findOneAndUpdate(
    { userId: interaction.user.id },
    { $inc: { yens: tier.yens } },
    { upsert: true }
  );

  // --- Rôle Discord ---
  let roleText = '_aucun rôle configuré_';
  const prestigeConfig = await PrestigeConfig.findOne({ guildId: interaction.guild.id });
  const roleId = prestigeConfig?.roles?.[nextTierIndex];
  if (roleId) {
    const member = await interaction.guild.members.fetch(interaction.user.id).catch(() => null);
    if (member) {
      await member.roles.add(roleId).catch(() => {});
      roleText = `<@&${roleId}>`;
      // Retire le rôle du palier précédent, s'il existe
      const previousRoleId = nextTierIndex > 0 ? prestigeConfig?.roles?.[nextTierIndex - 1] : null;
      if (previousRoleId) await member.roles.remove(previousRoleId).catch(() => {});
    }
  }

  // --- Message de récompense ---
  const lines = [
    `${tier.badge}`,
    tier.frame ? `🖼️ ${tier.frame}` : null,
    tier.title ? `🎖️ Titre : ${tier.title}` : null,
    tier.extra ? `🎁 ${tier.extra}` : null,
    `👑 Rôle : ${roleText}`,
    `💴 ${tier.yens.toLocaleString()} Yens`,
  ].filter(Boolean);

  const container = new ContainerBuilder().setAccentColor(0xFEE75C);
  container.addTextDisplayComponents(new TextDisplayBuilder().setContent(`### 🎉 ${tier.name} débloqué !`));
  container.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small));
  container.addTextDisplayComponents(new TextDisplayBuilder().setContent(lines.join('\n')));
  container.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small));
  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent('-# Ton niveau et ton XP repartent à 1.')
  );

  await interaction.reply({ flags: MessageFlags.IsComponentsV2, components: [container] });
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
