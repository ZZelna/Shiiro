const VoiceStats =
require("../models/VoiceStats");

global.voiceJoins =
global.voiceJoins || new Map();

module.exports =
async (oldState, newState) => {

    const userId =
        newState.id;

    // Join vocal
    if (
        !oldState.channelId &&
        newState.channelId
    ) {

        global.voiceJoins.set(
            userId,
            Date.now()
        );

    }

    // Leave vocal
    if (
        oldState.channelId &&
        !newState.channelId
    ) {

        const joinTime =
            global.voiceJoins.get(
                userId
            );

        if (!joinTime) return;

        const seconds =
            Math.floor(
                (
                    Date.now() -
                    joinTime
                ) / 1000
            );

        let stats =
            await VoiceStats.findOne({
                userId
            });

        if (!stats) {

            stats =
                await VoiceStats.create({
                    userId,
                    totalSeconds: 0
                });

        }

        stats.totalSeconds +=
            seconds;

        await stats.save();

        global.voiceJoins.delete(
            userId
        );

    }

};
