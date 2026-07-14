const mongoose = require("mongoose");

const warnSchema = new mongoose.Schema({

    guildId: {
        type: String,
        required: true
    },

    userId: {
        type: String,
        required: true
    },

    level: {
        type: Number,
        required: true
    },

    motif: {
        type: String,
        required: true
    },

    moderatorId: {
        type: String,
        required: true
    },

    createdAt: {
        type: Date,
        default: Date.now
    }

});

module.exports = mongoose.model("Warn", warnSchema);
