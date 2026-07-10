const { ElevenLabsClient } = require("elevenlabs");

const client = new ElevenLabsClient({
    apiKey: process.env.ELEVENLABS_API_KEY
});

async function generateVoice(text, voiceId) {

    try {

        const audio = await client.textToSpeech.convert(
            voiceId,
            {
                text: text.slice(0, 4000),
                model_id: "eleven_multilingual_v2",
                output_format: "mp3_44100_128"
            }
        );

        const chunks = [];

        for await (const chunk of audio) {
            chunks.push(chunk);
        }

        return Buffer.concat(chunks);

    } catch (err) {

        console.error("===== ELEVENLABS =====");
        console.error(err);
        console.log("Status :", err.statusCode);
        console.log("Message :", err.message);
        console.log("Body :", err.body);

        throw err;

    }

}

module.exports = {
    generateVoice
};
