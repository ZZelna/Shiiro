const mongoose = require("mongoose");

const jailSchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true },
    roles: { type: [String], default: [] },
    date: { type: Date, default: Date.now },
    moderatorId: { type: String, required: true },
    reason: { type: String, default: "Aucune raison fournie" },
    channelId: { type: String, default: null }
});

module.exports = mongoose.model("Jail", jailSchema);
