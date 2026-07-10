const axios = require("axios");
const { askGroq } = require("../systems/groq");

module.exports = async (message) => {

    if (message.author.bot) return;

    const allowedChannel = "1520976998439063673";

    const mentioned = message.mentions.has(message.client.user);

    const replied =
        message.reference &&
        (await message.fetchReference().catch(() => null))
            ?.author.id === message.client.user.id;

    if (
        !mentioned &&
        !replied &&
        message.channel.id !== allowedChannel
    ) return;

    let prompt = message.content
        .replace(`<@${message.client.user.id}>`, "")
        .replace(`<@!${message.client.user.id}>`, "")
        .trim();

    // Lecture des fichiers
    if (message.attachments.size > 0) {

        const file = message.attachments.first();

        const allowedExtensions = [
            ".js",
            ".ts",
            ".json",
            ".py",
            ".java",
            ".cpp",
            ".c",
            ".cs",
            ".php",
            ".go",
            ".rs",
            ".lua",
            ".html",
            ".css",
            ".sql",
            ".txt"
        ];

        if (
            allowedExtensions.some(ext =>
                file.name.toLowerCase().endsWith(ext)
            )
        ) {

            try {

                const { data } = await axios.get(file.url);

                prompt += `

Voici le contenu du fichier "${file.name}" :

\`\`\`
${data}
\`\`\`
`;

            } catch (err) {
                console.error(err);
            }

        }

    }

    if (!prompt.length) {
        return message.reply("💬 Pose-moi une question.");
    }

    try {

        const thinking = await message.reply(
            "💭 **Shiiro réfléchit...**"
        );

        await message.channel.sendTyping();

        const response = await askGemini(prompt);

        const parts = [];

        for (let i = 0; i < response.length; i += 1900) {
            parts.push(response.slice(i, i + 1900));
        }

        await thinking.edit(
            parts.shift() || "Aucune réponse."
        );

        for (const part of parts) {
            await message.reply(part);
        }

    } catch (err) {

        console.error("Erreur Gemini :", err);
console.error("Status :", err?.status);
console.error("Message :", err?.message);
console.error("Body :", err?.error);

        const status = err?.status || err?.error?.code;

        if (status === 503) {
            return message.reply(
                "⚠️ Shiiro IA est actuellement surchargée. Réessaie dans quelques instants."
            );
        }

        if (status === 429) {
            return message.reply(
                "⚠️ Trop de requêtes envoyées à l'IA. Réessaie dans quelques secondes."
            );
        }

        return message.reply(
            "❌ Une erreur est survenue lors de la génération de la réponse."
        );

    }

};
