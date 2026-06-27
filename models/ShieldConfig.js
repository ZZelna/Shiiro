const mongoose = require("mongoose");

const ShieldConfigSchema = new mongoose.Schema({

    guildId: {
        type: String,
        required: true,
        unique: true
    },

    enabled: {
        type: Boolean,
        default: true
    },

    ignoredChannels: {
        type: [String],
        default: []
    },

    ignoredRoles: {
        type: [String],
        default: []
    },

    whitelistLinks: {
        type: [String],
        default: []
    },

    punishment: {
        type: String,
        default: "timeout"
    },

    timeoutDuration: {
        type: Number,
        default: 20
    },

    logsChannel: {
        type: String,
        default: null
    }

});

module.exports = mongoose.model(
    "ShieldConfig",
    ShieldConfigSchema
);
