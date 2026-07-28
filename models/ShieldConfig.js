const mongoose = require("mongoose");

// Réglages d'un module individuel (antiSpam / antiLink / antiToxic).
const ModuleSettingsSchema = new mongoose.Schema({
    enabled: { type: Boolean, default: true },
    ignoredChannels: { type: [String], default: [] },
    ignoredRoles: { type: [String], default: [] }, // "utilisateur/rôle indépendant" choisi pour ce module
    whitelistLinks: { type: [String], default: [] },
    punishment: { type: String, default: "timeout" },
    timeoutDuration: { type: Number, default: 20 },
    logsChannel: { type: String, default: null },

    // ⚡ Exemptions basées sur les listes globales (voir models/PermissionList.js)
    exemptOwners: { type: Boolean, default: false },
    exemptWhitelist: { type: Boolean, default: false }
}, { _id: false });

// ⚡ Un seul document par guilde (même index guildId unique qu'avant),
// les réglages de chaque module vivent dans une Map interne.
const ShieldConfigSchema = new mongoose.Schema({

    guildId: {
        type: String,
        required: true,
        unique: true
    },

    // clé = moduleId ("antiSpam" | "antiLink" | "antiToxic"), valeur = ses réglages
    modules: {
        type: Map,
        of: ModuleSettingsSchema,
        default: {}
    }

});

module.exports = mongoose.model(
    "ShieldConfig",
    ShieldConfigSchema
);
