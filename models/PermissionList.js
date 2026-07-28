const mongoose = require("mongoose");

// Une seule liste par guilde, avec deux catégories d'utilisateurs
// gérables via la commande /permissionlist.
const PermissionListSchema = new mongoose.Schema({
    guildId: { type: String, required: true, unique: true },
    owners: { type: [String], default: [] },
    whitelist: { type: [String], default: [] }
});

module.exports = mongoose.model("PermissionList", PermissionListSchema);
