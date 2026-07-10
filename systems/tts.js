const edgeTTS = require("edge-tts");

async function generateVoice(text) {
    try {
        const { stream } = await edgeTTS.createStream({
            text: text.slice(0, 4000),
            voice: "fr-FR-DeniseNeural"
        });

        const chunks = [];

        for await (const chunk of stream) {
            chunks.push(chunk);
        }

        return Buffer.concat(chunks);

    } catch (err) {
        console.error("===== EDGE TTS =====");
        console.error(err);
        throw err;
    }
}

module.exports = {
    generateVoice
};
