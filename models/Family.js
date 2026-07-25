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
            default: "Famille"
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
            userId: {
                type: String,
                required: true
            },

            name: {
                type: String,
                required: true
            },

            gender: {
                type: String,
                default: "Inconnu"
            },

            age: {
                type: Number,
                default: 0
            },

            happiness: {
                type: Number,
                default: 100
            },

            intelligence: {
                type: Number,
                default: 0
            },

            createdAt: {
                type: Date,
                default: Date.now
            }
        }],

        lastBaby: {
            type: Number,
            default: null
        },

        maxChildren: {
            type: Number,
            default: 3
        },

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
