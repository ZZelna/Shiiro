const mongoose = require("mongoose");

module.exports = mongoose.model(
    "CasinoProfile",
    new mongoose.Schema({
        userId: String,
        yens: {
            type: Number,
            default: 1000
        },
        gifts: {
            type: Number,
            default: 0
        },
        lastDaily: {
            type: Date,
            default: null
        }
    })
);
