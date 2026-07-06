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

    // pending = en attente
    // approved = publiée
    // refused = refusée
    status: {
        type: String,
        default: "pending"
    },

    likes: [{
        type: String
    }],

    dislikes: [{
        type: String
    }],

    replies: [{
        authorId: String,
        content: String,
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],

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
