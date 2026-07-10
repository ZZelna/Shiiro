const {
    AttachmentBuilder
} = require("discord.js");

const { askGemini } = require("../systems/gemini");

module.exports = async (message) => {

    if (message.author.bot) return;

    if (!message.mentions.has(message.client.user)) return;

    await message.channel.sendTyping();

    const prompt = message.content
        .replace(`<@${message.client.user.id}>`, "")
        .replace(`<@!${message.client.user.id}>`, "")
        .trim();

    if (!prompt.length) {
        return message.reply(
            "💬 Pose-moi une question après m'avoir mentionné."
        );
    }

    try {

        const response = await askGemini(prompt);

        if (!response) {
            return message.reply(
                "❌ Aucune réponse."
            );
        }

        if (response.length <= 2000) {

            return message.reply(response);

        }

        const file = new AttachmentBuilder(
            Buffer.from(response, "utf8"),
            {
                name: "reponse.txt"
            }
        );

        return message.reply({
            content:
                "📄 La réponse est trop longue, la voici en fichier.",
            files: [file]
        });

    } catch (err) {

        console.error(err);

        return message.reply(
            "❌ Impossible de contacter Gemini."
        );

    }

};
