const { createVoice } = require("../systems/voiceManager");
const config = require("../config/voiceConfig");

module.exports = async (oldState, newState) => {

    if (!newState.member) return;

    if (!newState.channel) return;

    if (newState.channel.id !== config.createChannelId) return;

    try {

        await createVoice(newState.member);

    } catch (err) {

        console.error("[VOICE CREATE]", err);

    }

};
