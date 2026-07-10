const { EdgeTTS } = require("@andresaya/edge-tts");

async function generateVoice(text) {

    const tts = new EdgeTTS();

    const result = await tts.synthesize(
        text.slice(0, 4000),
        "fr-FR-DeniseNeural"
    );

    console.log("TYPE :", typeof result);
    console.log("RESULT :", result);
    console.log("CLÉS :", Object.keys(result || {}));

    return null;
}

module.exports = {
    generateVoice
};
