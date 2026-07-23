const { createVoice } = require("../systems/voiceManager");
const config = require("../config/voiceConfig");

module.exports = async (oldState, newState) => {

    // Si l'utilisateur quitte un serveur
    if (!newState.member) return;

    // Il n'a rejoint aucun salon
    if (!newState.channel) return;

    // Ce n'est pas le salon "Créer un vocal"
    if (newState.channel.id !== config.createChannelId) return;

    try {

        await createVoice(newState.member);

    } catch (err) {

        console.error("[VOICE CREATE]", err);

    }

}
