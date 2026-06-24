const mongoose = require("mongoose");

module.exports = mongoose.model(
    "GlobalBlacklist",
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
