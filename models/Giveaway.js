const mongoose = require("mongoose");

module.exports = mongoose.model(
    "Giveaway",
    new mongoose.Schema({

        messageId: String,
        channelId: String,
        guildId: String,

        prize: String,

        type: String,

        winnersCount: Number,

        participants: {
            type: [String],
            default: []
        },

        winners: {
            type: [String],
            default: []
        },

        endAt: Number,

        ended: {
            type: Boolean,
            default: false
        }

    })
);
