const mongoose = require("mongoose");

const permissionOverwriteSchema = new mongoose.Schema({
    id: String,
    type: Number,
    allow: String,
    deny: String
}, { _id: false });

const channelSchema = new mongoose.Schema({
    id: String,
    name: String,
    type: Number,
    position: Number,
    parentId: String,
    topic: String,
    nsfw: Boolean,
    rateLimitPerUser: Number,
    bitrate: Number,
    userLimit: Number,
    rtcRegion: String,
    videoQualityMode: Number,
    defaultAutoArchiveDuration: Number,
    permissionOverwrites: [permissionOverwriteSchema]
}, { _id: false });

const roleSchema = new mongoose.Schema({
    id: String,
    name: String,
    color: Number,
    permissions: String,
    hoist: Boolean,
    mentionable: Boolean,
    position: Number,
    icon: String,
    unicodeEmoji: String,
    managed: Boolean
}, { _id: false });

const emojiSchema = new mongoose.Schema({
    name: String,
    url: String,
    animated: Boolean
}, { _id: false });

const stickerSchema = new mongoose.Schema({
    name: String,
    description: String,
    tags: String,
    url: String
}, { _id: false });

const backupSchema = new mongoose.Schema({
    guildId: { type: String, unique: true },
    guildName: String,
    guildIcon: String,
    guildBanner: String,
    createdBy: String,
    createdAt: Date,
    settings: mongoose.Schema.Types.Mixed,
    roles: [roleSchema],
    channels: [channelSchema],
    emojis: [emojiSchema],
    stickers: [stickerSchema],
    webhooks: [mongoose.Schema.Types.Mixed],
    afkChannel: String,
    afkTimeout: Number,
    verificationLevel: Number
});

module.exports = mongoose.models.Backup || mongoose.model("Backup", backupSchema);
