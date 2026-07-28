const mongoose = require("mongoose");

// Réglages d'un module individuel (antiSpam / antiLink / antiToxic).
const ModuleSettingsSchema = new mongoose.Schema({
    enabled: { type: Boolean, default: true },
    ignoredChannels: { type: [String], default: [] },
    ignoredRoles: { type: [String], default: [] },
    whitelistLinks: { type: [String], default: [] },
    punishment: { type: String, default: "timeout" },
    timeoutDuration: { type: Number, default: 20 },
    logsChannel: { type: String, default: null }
}, { _id: false });

// ⚡ Un seul document par guilde (comme avant, même index guildId
// unique), mais les réglages de chaque module vivent maintenant dans
// une Map interne au lieu d'être éclatés en plusieurs documents.
// Aucune modification d'index nécessaire côté MongoDB.
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
