const mongoose = require("mongoose");

const confessionConfigSchema = new mongoose.Schema({

    guildId: {
        type: String,
        required: true,
        unique: true
    },

    confessionChannel: {
        type: String,
        default: null
    },

    logChannel: {
        type: String,
        default: null
    },

    moderatorRole: {
        type: String,
        default: null
    },

    // Salon où est envoyé le panneau
    panelChannel: {
        type: String,
        default: null
    },

    // Message du panneau
    panelMessage: {
        type: String,
        default: null
    },

    counter: {
        type: Number,
        default: 0
    },

    blacklist: [{
        type: String
    }]

});

module.exports = mongoose.model(
    "ConfessionConfig",
    confessionConfigSchema
);
