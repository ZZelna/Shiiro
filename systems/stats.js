const mongoose = require("mongoose");

const statsSchema = new mongoose.Schema({

    userId: String,

    messages: {
        type: Number,
        default: 0
    },

    xp: {
        type: Number,
        default: 0
    },

    level: {
        type: Number,
        default: 1
    },

    dailyMessages: {
        type: Map,
        of: Number,
        default: {}
    }

});

module.exports =
    mongoose.model(
        "Stats",
        statsSchema
    );
