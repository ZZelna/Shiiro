const CasinoChannel = require("../../models/CasinoChannel");

async function getCasinoChannel(guildId) {
    const doc = await CasinoChannel.findOne({ guildId });
    return doc?.channelId || null;
}

async function setCasinoChannel(guildId, channelId) {
    return CasinoChannel.findOneAndUpdate(
        { guildId },
        { guildId, channelId },
        { upsert: true, new: true }
    );
}

module.exports = { getCasinoChannel, setCasinoChannel };
