const mongoose = require("mongoose");

module.exports = mongoose.model(
    "Clan",
    new mongoose.Schema({
        name: String,

        ownerId: String,

        members: {
            type: [String],
            default: [],
            validate: [
                arr => arr.length <= 5,
                "Un clan ne peut pas dépasser 5 membres."
            ]
        },

        totalYens: {
            type: Number,
            default: 0
        },

        weeklyYens: {
            type: Number,
            default: 0
        },

        channelId: String,

        createdAt: {
            type: Date,
            default: Date.now
        }
    })
);
