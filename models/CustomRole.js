const { Schema, model } = require('mongoose');

const customRoleSchema = new Schema({
  guildId: { type: String, required: true },
  userId: { type: String, required: true },
  roleId: { type: String, required: true },
  name: { type: String, required: true },
  color: { type: String, required: true }, // hex, ex: "#5865F2"
  icon: { type: String, default: null },    // emoji unicode OU URL d'image
  commandName: { type: String, required: true, lowercase: true }, // ex: "ascension" -> +ascension
  sharedWith: { type: [String], default: [] }, // userIds ayant reçu le rôle via la commande
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Un seul rôle perso par joueur et par serveur
customRoleSchema.index({ guildId: 1, userId: 1 }, { unique: true });
// Un nom de commande ne peut être utilisé qu'une fois par serveur
customRoleSchema.index({ guildId: 1, commandName: 1 }, { unique: true });

module.exports = model('CustomRole', customRoleSchema);
