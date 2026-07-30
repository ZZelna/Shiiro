const mongoose = require("mongoose");

module.exports = mongoose.model(
    "CasinoChannel",
    new mongoose.Schema({
        guildId: { type: String, required: true, unique: true },
        channelId: { type: String, default: null }
    })
);
