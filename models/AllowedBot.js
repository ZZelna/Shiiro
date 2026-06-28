const { Schema, model } = require("mongoose");

module.exports = model(
    "AllowedBot",
    new Schema({
        botId: {
            type: String,
            required: true,
            unique: true
        },
        addedBy: {
            type: String,
            default: null
        },
        addedAt: {
            type: Date,
            default: Date.now
        }
    })
);
