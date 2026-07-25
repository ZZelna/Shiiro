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

        // Enfant adopté ou biologique
        adopted: {
            type: Boolean,
            default: false
        },

        // Type de naissance
        birthType: {
            type: String,
            enum: [
                "biological",
                "adopted"
            ],
            default: "biological"
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

        energy: {
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

        // Cooldowns

        lastSchool: {
            type: Number,
            default: 0
        },

        lastWork: {
            type: Number,
            default: 0
        },

        lastPlay: {
            type: Number,
            default: 0
        },

        lastFeed: {
            type: Number,
            default: 0
        },

        // Travail

        job: {
            type: String,
            default: null
        },

        salary: {
            type: Number,
            default: 0
        },

        // Mariage

        marriedTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Child",
            default: null
        },

        spouseId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Child",
            default: null
        },

        // Enfants

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
