const CasinoChannel = require("../../models/CasinoChannel");

async function getCasinoChannels(guildId) {
    const doc = await CasinoChannel.findOne({ guildId });
    return doc?.channelIds || [];
}

async function setCasinoChannels(guildId, channelIds) {
    return CasinoChannel.findOneAndUpdate(
        { guildId },
        { guildId, channelIds },
        { upsert: true, new: true }
    );
}

module.exports = { getCasinoChannels, setCasinoChannels };
