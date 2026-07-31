const mongoose = require("mongoose");

module.exports = mongoose.model(
    "GameChannel",
    new mongoose.Schema({
        guildId: { type: String, required: true, unique: true },
        channelIds: { type: [String], default: [] }
    })
);
