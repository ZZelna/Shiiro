const axios = require("axios");
const { askGemini } = require("../systems/gemini");

module.exports = async (message) => {

    if (message.author.bot) return;

    const allowedChannel = "1520976998439063673";

    const mentioned = message.mentions.has(message.client.user);

    const replied =
        message.reference &&
        (
            await message.fetchReference().catch(() => null)
        )?.author.id === message.client.user.id;

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

        for (
            let i = 0;
            i < response.length;
            i += 1900
        ) {

            parts.push(
                response.slice(i, i + 1900)
            );

        }

        await thinking.edit(
            parts.shift() || "Aucune réponse."
        );

        for (const part of parts) {

            await message.reply(part);

        }

    } catch (err) {

        console.error("===== ERREUR GEMINI =====");
        console.error(err);

        return message.reply(
            "```js\n" +
            (err.stack ||
                err.message ||
                JSON.stringify(err, null, 2)) +
            "\n```"
        );

    }

};
