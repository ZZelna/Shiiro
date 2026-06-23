const mongoose = require("mongoose");

const giveawaySchema = new mongoose.Schema({
    messageId: String,
    channelId: String,
    guildId: String,

    type: String,
    prize: String,

    winnersCount: Number,

    participants: {
        type: [String],
        default: []
    },

    endAt: Number,

    ended: {
        type: Boolean,
        default: false
    },

    winners: {
        type: [String],
        default: []
    },

    createdBy: String
});

module.exports = mongoose.model(
    "Giveaway",
    giveawaySchema
);
