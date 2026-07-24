const mongoose = require("mongoose");

module.exports = mongoose.model(
    "Marriage",
    new mongoose.Schema({
        guildId: {
            type: String,
            required: true,
            index: true
        },

        users: {
            type: [String],
            required: true,
            validate: v => v.length === 2
        },

        marriedAt: {
            type: Date,
            default: Date.now
        },

        proposerId: {
            type: String
        },

        familyId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Family",
            default: null
        },

        love: {
            type: Number,
            default: 0
        },

        kisses: {
            type: Number,
            default: 0
        },

        hugs: {
            type: Number,
            default: 0
        },

        gifts: {
            type: Number,
            default: 0
        },

        voiceSeconds: {
            type: Number,
            default: 0
        },

        messagesTogether: {
            type: Number,
            default: 0
        },

        lastDaily: {
            type: Date,
            default: null
        }
    })
);
