const mongoose = require("mongoose");

const BackupSchema = new mongoose.Schema({

    guildId: {
        type: String,
        required: true
    },

    guildName: {
        type: String,
        required: true
    },

    guildIcon: {
        type: String,
        default: null
    },

    createdBy: {
        type: String,
        required: true
    },

    createdAt: {
        type: Date,
        default: Date.now
    },

    roles: [
        {
            name: String,
            color: Number,
            permissions: String,
            hoist: Boolean,
            mentionable: Boolean,
            position: Number
        }
    ],

    channels: [
        {
            name: String,
            type: Number,
            position: Number,

            parent: {
                type: String,
                default: null
            },

            topic: {
                type: String,
                default: null
            },

            nsfw: {
                type: Boolean,
                default: false
            },

            rateLimitPerUser: {
                type: Number,
                default: 0
            },

            bitrate: {
                type: Number,
                default: 64000
            },

            userLimit: {
                type: Number,
                default: 0
            },

            permissionOverwrites: [
                {
                    id: String,
                    type: Number,
                    allow: String,
                    deny: String
                }
            ]
        }
    ]

});

module.exports = mongoose.model(
    "Backup",
    BackupSchema
);
