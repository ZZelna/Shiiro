const {
    createVoice,
    deleteVoice
} = require("../systems/voiceManager");

const config = require("../config/voiceConfig");

module.exports = async (oldState, newState) => {

    // Création du salon
    if (
        newState.member &&
        newState.channel &&
        newState.channel.id === config.createChannelId
    ) {

        try {

            await createVoice(newState.member);

        } catch (err) {

            console.error("[VOICE CREATE]", err);

        }

    }

    // Suppression du salon vide
    if (oldState.channel) {

        try {

            await deleteVoice(oldState.channel);

        } catch (err) {

            console.error("[VOICE DELETE]", err);

        }

    }

};
