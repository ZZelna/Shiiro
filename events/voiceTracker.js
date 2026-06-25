const VoiceStats =
require("../models/VoiceStats");

global.voiceJoins =
global.voiceJoins || new Map();

module.exports =
async (oldState, newState) => {

    console.log(
        "VOICE EVENT",
        oldState.channelId,
        "=>",
        newState.channelId
    );

    const userId =
        newState.id;

    // Join vocal
    if (
        !oldState.channelId &&
        newState.channelId
    ) {

        console.log(
            "JOIN",
            userId
        );

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

        console.log(
            "LEAVE",
            userId
        );

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

        console.log(
            "SAVE",
            seconds
        );

        await stats.save();

        global.voiceJoins.delete(
            userId
        );

    }

};
