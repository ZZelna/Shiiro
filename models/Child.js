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
            required: true
        },

        // Nouveau champ
        adopted: {
            type: Boolean,
            default: false
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

        health: {
            type: Number,
            default: 100
        },

        intelligence: {
            type: Number,
            default: 0
        },

        level: {
            type: Number,
            default: 1
        },

        xp: {
            type: Number,
            default: 0
        },

        school: {
            type: Number,
            default: 1
        },

        lastSchool: {
    type: Number,
    default: 0
},
        
        job: {
            type: String,
            default: null
        },

        salary: {
            type: Number,
            default: 0
        },

        marriedTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Child",
            default: null
        },

        children: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Child"
        }],

        createdAt: {
            type: Date,
            default: Date.now
        }

    })
);
