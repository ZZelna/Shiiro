const mongoose = require("mongoose");

module.exports = mongoose.model(
    "Child",
    new mongoose.Schema({
        familyId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Family",
            required: true
        },

        name: {
            type: String,
            required: true
        },

        gender: {
            type: String,
            enum: ["boy", "girl"]
        },

        age: {
            type: Number,
            default: 0
        },

        happiness: {
            type: Number,
            default: 100
        },

        hunger: {
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

        affection: {
            type: Number,
            default: 100
        },

        createdAt: {
            type: Date,
            default: Date.now
        }
    })
);
