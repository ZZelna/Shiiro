const { ElevenLabsClient } = require("elevenlabs");

const client = new ElevenLabsClient({
    apiKey: process.env.ELEVENLABS_API_KEY
});

async function generateVoice(text, voiceId) {

    const audio = await client.textToSpeech.convert(
        voiceId,
        {
            text,
            model_id: "eleven_multilingual_v2",
            output_format: "mp3_44100_128"
        }
    );

    const chunks = [];

    for await (const chunk of audio) {
        chunks.push(chunk);
    }

    return Buffer.concat(chunks);
}

module.exports = {
    generateVoice
};
