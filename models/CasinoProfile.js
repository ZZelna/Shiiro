const mongoose = require("mongoose");

module.exports = mongoose.model(
    "CasinoProfile",
    new mongoose.Schema({

        userId: {
            type: String,
            unique: true
        },

        yens: {
            type: Number,
            default: 0
        },

        gifts: {
            type: Number,
            default: 0
        }

    })
);
