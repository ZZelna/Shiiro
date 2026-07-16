const mongoose = require("mongoose");

const QuizProfileSchema = new mongoose.Schema({

    userId: {
        type: String,
        required: true,
        unique: true
    },

    level: {
        type: Number,
        default: 1
    },

    xp: {
        type: Number,
        default: 0
    },

    correct: {
        type: Number,
        default: 0
    },

    wrong: {
        type: Number,
        default: 0
    },

    totalGames: {
        type: Number,
        default: 0
    },

    currentStreak: {
        type: Number,
        default: 0
    },

    bestStreak: {
        type: Number,
        default: 0
    },

    fastestAnswer: {
        type: Number,
        default: 0
    },

    coinsWon: {
        type: Number,
        default: 0
    },

    categories: {
        culture: {
            type: Number,
            default: 0
        },
        histoire: {
            type: Number,
            default: 0
        },
        geographie: {
            type: Number,
            default: 0
        },
        sciences: {
            type: Number,
            default: 0
        },
        informatique: {
            type: Number,
            default: 0
        },
        anime: {
            type: Number,
            default: 0
        },
        cinema: {
            type: Number,
            default: 0
        },
        musique: {
            type: Number,
            default: 0
        },
        sport: {
            type: Number,
            default: 0
        }
    },

    achievements: {
        type: [String],
        default: []
    },

    lastDaily: {
        type: Date,
        default: null
    }

}, {
    timestamps: true
});

module.exports = mongoose.model(
    "QuizProfile",
    QuizProfileSchema
);
