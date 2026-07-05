const mongoose = require("mongoose");

const confessionSchema = new mongoose.Schema({

    guildId: {
        type: String,
        required: true
    },

    channelId: {
        type: String,
        required: true
    },

    messageId: {
        type: String,
        default: null
    },

    authorId: {
        type: String,
        required: true
    },

    number: {
        type: Number,
        required: true
    },

    content: {
        type: String,
        required: true
    },

    reports: [{
        type: String
    }],

    deleted: {
        type: Boolean,
        default: false
    },

    createdAt: {
        type: Date,
        default: Date.now
    }

});

module.exports = mongoose.model(
    "Confession",
    confessionSchema
);
