const { Schema, model } = require('mongoose');

const prestigeConfigSchema = new Schema({
  guildId: { type: String, required: true, unique: true },
  // roles[0] = rôle Prestige I, roles[9] = rôle Prestige X
  roles: { type: [String], default: () => Array(10).fill(null) },
});

module.exports = model('PrestigeConfig', prestigeConfigSchema);
