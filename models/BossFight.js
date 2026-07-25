const { Schema, model } = require('mongoose');

const bossFightSchema = new Schema({
  guildId: { type: String, required: true, unique: true },
  name: { type: String, default: 'Boss' },
  category: { type: String, default: null }, // ex: "Histoire", "Géographie" — null = toutes catégories confondues
  maxHp: { type: Number, required: true },
  currentHp: { type: Number, required: true },
  active: { type: Boolean, default: true },
  channelId: { type: String, default: null },
  messageId: { type: String, default: null },
  // Dégâts cumulés par joueur (clé = userId)
  damageByPlayer: { type: Map, of: Number, default: () => new Map() },
  startedAt: { type: Date, default: Date.now },
  endedAt: { type: Date, default: null },
});

module.exports = model('BossFight', bossFightSchema);
