const mongoose = require("mongoose");

module.exports = mongoose.model(
    "MarriageRequest",
    new mongoose.Schema({
        guildId: String,

        authorId: String,

        targetId: String,

        createdAt: {
            type: Date,
            default: Date.now,
            expires: 60
        }
    })
);
