const { Schema, model } = require("mongoose");

const voiceChannelSchema = new Schema({

    guildId: {
        type: String,
        required: true
    },

    channelId: {
        type: String,
        required: true,
        unique: true
    },

    ownerId: {
        type: String,
        required: true
    },

    bannedUsers: {
        type: [String],
        default: []
    },

    createdAt: {
        type: Date,
        default: Date.now
    }

});

module.exports = model("VoiceChannel", voiceChannelSchema);
