const mongoose = require("mongoose");

const choiceSchema = new mongoose.Schema({
    label: {
        type: String,
        required: true
    },
    votes: {
        type: [String],
        default: []
    }
}, { _id: false });

module.exports = mongoose.model("Survey", new mongoose.Schema({

    guildId: {
        type: String,
        required: true
    },

    channelId: {
        type: String,
        required: true
    },

    messageId: {
        type: String,
        default: null
    },

    authorId: {
        type: String,
        required: true
    },

    question: {
        type: String,
        required: true
    },

    choices: {
        type: [choiceSchema],
        required: true
    },

    anonymous: {
        type: Boolean,
        default: false
    },

    endAt: {
        type: Number,
        required: true
    },

    ended: {
        type: Boolean,
        default: false
    },

    totalVotes: {
        type: Number,
        default: 0
    },

    createdAt: {
        type: Date,
        default: Date.now
    }

}));
