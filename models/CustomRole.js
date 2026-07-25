const { Schema, model } = require('mongoose');

const customRoleSchema = new Schema({
  guildId: { type: String, required: true },
  userId: { type: String, required: true },
  roleId: { type: String, required: true },
  name: { type: String, required: true },
  color: { type: String, required: true }, // hex, ex: "#5865F2"
  icon: { type: String, default: null },    // emoji unicode OU URL d'image
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Un seul rôle perso par joueur et par serveur
customRoleSchema.index({ guildId: 1, userId: 1 }, { unique: true });

module.exports = model('CustomRole', customRoleSchema);
