const { ElevenLabsClient } = require("elevenlabs");

const client = new ElevenLabsClient({
    apiKey: process.env.ELEVENLABS_API_KEY
});

async function generateVoice(text, voiceId) {

    const audio = await client.textToSpeech.convert(voiceId, {
        text,
        model_id: "eleven_multilingual_v2",
        output_format: "mp3_44100_128"
    });

    return Buffer.from(await audio.arrayBuffer());
}

module.exports = {
    generateVoice
};
