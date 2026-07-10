const { EdgeTTS } = require("@andresaya/edge-tts");

async function generateVoice(text) {

    try {

        const tts = new EdgeTTS();

        const audio = await tts.synthesize(
            text.slice(0, 4000),
            "fr-FR-DeniseNeural"
        );

        return Buffer.from(audio);

    } catch (err) {

        console.error("===== EDGE TTS =====");
        console.error(err);

        return null;

    }

}

module.exports = {
    generateVoice
};
