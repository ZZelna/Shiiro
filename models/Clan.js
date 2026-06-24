const mongoose = require("mongoose");

module.exports = mongoose.model(
    "Clan",
    new mongoose.Schema({
        name: String,
        ownerId: String,
        members: [String],
        totalYens: {
            type: Number,
            default: 0
        },
        channelId: String,
        createdAt: {
            type: Date,
            default: Date.now
        }
    })
);
