const axios = require("axios");
const { askGroq } = require("../systems/groq");
const AiLimit = require("../models/AiLimit");
const { generateVoice } = require("../systems/tts");

const BYPASS_ROLES = [
    "1506674274826584284"
];

const BOT_OWNER = "1418370654251778168";

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
        return message.reply(
            "💬 Pose-moi une question."
        );
    }

    try {

        const thinking = await message.reply(
            "💭 **Shiiro réfléchit...**"
        );

        await message.channel.sendTyping();

        const hasBypass =
            message.member.roles.cache.some(role =>
                BYPASS_ROLES.includes(role.id)
            );

        if (!hasBypass && prompt.length > 5000) {

            const today =
                new Date().toISOString().slice(0, 10);

            let limit =
                await AiLimit.findOne({
                    userId: message.author.id,
                    date: today
                });

            if (!limit) {

                limit =
                    await AiLimit.create({
                        userId: message.author.id,
                        date: today
                    });

            }

            if (limit.bigPrompts >= 5) {

                return message.reply(
                    "❌ Tu as utilisé tes **5 gros prompts** aujourd'hui.\nRéessaie demain ou contacte un administrateur."
                );

            }

            limit.bigPrompts++;

            await limit.save();

        }

        const response =
            await askGroq(prompt);

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
            parts.shift() ||
            "Aucune réponse."
        );

        for (const part of parts) {

            await message.reply(part);

        }

        if (
            message.author.id === BOT_OWNER ||
            message.author.id === message.guild.ownerId
        ) {

            try {

                const audio =
                    await generateVoice(
                        response
                    );

                if (audio) {

                    await message.reply({
                        files: [
                            {
                                attachment: audio,
                                name: "shiiro.mp3"
                            }
                        ]
                    });

                }

            } catch (err) {

                console.error(
                    "Erreur Edge TTS :",
                    err
                );

            }

        }

    } catch (err) {

        console.error(err);

        return message.reply(
            "❌ Une erreur est survenue lors de la génération de la réponse."
        );

    }

};
