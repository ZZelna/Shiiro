const mongoose = require("mongoose");

module.exports = mongoose.model(
    "Child",
    new mongoose.Schema({

        guildId: {
            type: String,
            required: true
        },

        familyId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Family",
            required: true
        },

        userId: {
            type: String,
            required: true
        },

        name: {
            type: String,
            required: true,
            maxlength: 20
        },

        gender: {
            type: String,
            enum: ["Garçon", "Fille"],
            required: true
        },

        age: {
            type: Number,
            default: 0
        },

        happiness: {
            type: Number,
            default: 100
        },

        health: {
            type: Number,
            default: 100
        },

        intelligence: {
            type: Number,
            default: 0
        },

        school: {
            type: Number,
            default: 1
        },

        level: {
            type: Number,
            default: 1
        },

        xp: {
            type: Number,
            default: 0
        },

        createdAt: {
            type: Date,
            default: Date.now
        }

    })
);
