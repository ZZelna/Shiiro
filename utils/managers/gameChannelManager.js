const GameChannel = require("../../models/GameChannel");

async function getGameChannels(guildId) {
    const doc = await GameChannel.findOne({ guildId });
    return doc?.channelIds || [];
}

async function setGameChannels(guildId, channelIds) {
    return GameChannel.findOneAndUpdate(
        { guildId },
        { guildId, channelIds },
        { upsert: true, new: true }
    );
}

module.exports = { getGameChannels, setGameChannels };
