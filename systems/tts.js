const { EdgeTTS } = require("@andresaya/edge-tts");

async function generateVoice(text) {
    try {
        const tts = new EdgeTTS();

        const result = await tts.synthesize(
            text.slice(0, 4000),
            "fr-FR-DeniseNeural"
        );

        console.log(result);

        return null;
    } catch (err) {
        console.error(err);
        return null;
    }
}

module.exports = {
    generateVoice
};
