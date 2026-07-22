const { Schema, model } = require('mongoose');

const guildConfigSchema = new Schema({
  guildId: { type: String, required: true, unique: true },
  channels: {
    // Jouer aux quiz
    quizSolo: { type: String, default: null },
    duel: { type: String, default: null },
    duo2v2: { type: String, default: null },
    battleRoyale: { type: String, default: null },
    tournoi: { type: String, default: null },
    classeVsClasse: { type: String, default: null },
    bossHebdo: { type: String, default: null },
    marathon: { type: String, default: null },
    // Progression
    profil: { type: String, default: null },
    succes: { type: String, default: null },
    collections: { type: String, default: null },
    boutique: { type: String, default: null },
    inventaire: { type: String, default: null },
    // Informations quiz
    classements: { type: String, default: null },
    xpEtNiveaux: { type: String, default: null },
    misesAJour: { type: String, default: null },
    evenements: { type: String, default: null },
  },
});

module.exports = model('GuildConfig', guildConfigSchema);
