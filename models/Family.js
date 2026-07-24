const mongoose = require("mongoose");

module.exports = mongoose.model(
    "Family",
    new mongoose.Schema({
        guildId: {
            type: String,
            required: true
        },

        name: {
            type: String,
            required: true,
            maxlength: 30
        },

        ownerId: {
            type: String,
            required: true
        },

        marriageId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Marriage"
        },

        members: {
            type: [String],
            default: []
        },

        children: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Child"
        }],

        level: {
            type: Number,
            default: 1
        },

        xp: {
            type: Number,
            default: 0
        },

        coins: {
            type: Number,
            default: 0
        },

        createdAt: {
            type: Date,
            default: Date.now
        }
    })
);
