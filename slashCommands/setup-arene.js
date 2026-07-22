const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const GuildConfig = require('../models/GuildConfig');

// clé de config -> mot-clé à retrouver dans le nom du salon (sans accents, sans emoji)
const CHANNEL_MAP = {
  quizSolo: 'quiz-solo',
  duel: 'duel',
  duo2v2: 'duo-2v2',
  battleRoyale: 'battle-royale',
  tournoi: 'tournoi',
  classeVsClasse: 'classe-vs-classe',
  bossHebdo: 'boss-hebdo',
  marathon: 'marathon',
  profil: 'profil',
  succes: 'succes',
  collections: 'collections',
  boutique: 'boutique',
  inventaire: 'inventaire',
  classements: 'classements',
  xpEtNiveaux: 'xp-et-niveaux',
  misesAJour: 'mises-a-jour',
  evenements: 'evenements',
};

// Retire les accents et met en minuscule pour comparer "événements" et "evenements"
function normalize(str) {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setup-arene')
    .setDescription("Détecte automatiquement les salons de l'Arène et configure le bot")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const channels = await interaction.guild.channels.fetch();
    const found = {};
    const missing = [];

    for (const [key, slug] of Object.entries(CHANNEL_MAP)) {
      const channel = channels.find(c => c && c.isTextBased?.() && normalize(c.name).includes(slug));
      if (channel) {
        found[key] = channel.id;
      } else {
        missing.push(slug);
      }
    }

    await GuildConfig.findOneAndUpdate(
      { guildId: interaction.guild.id },
      { guildId: interaction.guild.id, channels: found },
      { upsert: true }
    );

    const embed = new EmbedBuilder()
      .setColor(missing.length ? 0xFFA500 : 0x57F287)
      .setTitle("🔧 Configuration de l'Arène")
      .setDescription(
        `✅ **${Object.keys(found).length}** salons détectés et enregistrés.` +
        (missing.length ? `\n⚠️ Introuvables : ${missing.map(s => `\`${s}\``).join(', ')}` : '')
      );

    await interaction.editReply({ embeds: [embed] });
  },
};
