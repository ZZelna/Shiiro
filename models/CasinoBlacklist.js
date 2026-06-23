const mongoose = require("mongoose");

module.exports = mongoose.model(
    "CasinoBlacklist",
    new mongoose.Schema({
        userId: String,
        reason: String,
        moderatorId: String,
        createdAt: {
            type: Date,
            default: Date.now
        }
    })
);
