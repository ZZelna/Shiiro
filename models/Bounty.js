const mongoose = require("mongoose");

module.exports = mongoose.model(
    "Bounty",
    new mongoose.Schema({
        targetId: { type: String, required: true, unique: true },
        posterId: { type: String, required: true },
        amount: { type: Number, required: true },
        messageId: { type: String, default: null },
        createdAt: { type: Date, default: Date.now }
    })
);
