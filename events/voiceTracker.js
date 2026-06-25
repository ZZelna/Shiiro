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

    // Join
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

    // Quitte ou change de salon
    if (
        oldState.channelId &&
        oldState.channelId !==
        newState.channelId
    ) {

        console.log(
            "LEAVE DETECTED",
            userId
        );

        const joinTime =
            global.voiceJoins.get(
                userId
            );

        if (!joinTime)
            return;

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

        console.log(
            "SAVE",
            stats.totalSeconds
        );

        global.voiceJoins.delete(
            userId
        );

    }

};
