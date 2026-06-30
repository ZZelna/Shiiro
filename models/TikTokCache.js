const mongoose = require("mongoose");

const TikTokCache = new mongoose.Schema({

    username: {
        type: String,
        required: true
    },

    lastVideo: {
        type: String,
        default: null
    },

    liveId: {
        type: String,
        default: null
    },

    isLive: {
        type: Boolean,
        default: false
    }

});

module.exports = mongoose.model(
    "TikTokCache",
    TikTokCache
);
