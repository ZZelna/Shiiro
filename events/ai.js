const axios = require("axios");
const { askGroq } = require("../systems/groq");
const AiLimit = require("../models/AiLimit");


const BYPASS_ROLES = [
    "1506674274826584284"
];

module.exports = async (message) => {

    if (message.author.bot) return;
    if (!message.guild) {
    return message.reply(
        "❌ Shiiro IA fonctionne uniquement sur un serveur."
    );
}

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
const members = message.guild.members.cache
    .filter(m => !m.user.bot)
    .map(m => m.displayName)
    .slice(0, 20)
    .join(", ");

const finalPrompt = `
Informations sur le serveur

Nom : ${message.guild.name}
Nombre de membres : ${message.guild.memberCount}

Utilisateur :
- Pseudo : ${message.member.displayName}
- ID : ${message.author.id}

Salons :
${message.channel.name}

Quelques membres :
${members}

Question :

${prompt}
`;

        const response = await askGroq(finalPrompt);

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
    } catch (err) {

        console.error(err);

        return message.reply(
            "❌ Une erreur est survenue lors de la génération de la réponse."
        );

    }

};
