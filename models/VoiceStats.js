const mongoose =
require("mongoose");

module.exports =
mongoose.model(
    "VoiceStats",
    new mongoose.Schema({

        userId: String,

        totalSeconds: {
            type: Number,
            default: 0
        },

        updatedAt: {
            type: Date,
            default: Date.now
        }

    })
);
