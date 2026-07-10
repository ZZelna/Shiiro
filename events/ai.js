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

    await message.channel.sendTyping();

    let prompt = message.content;

    prompt = prompt
        .replace(`<@${message.client.user.id}>`, "")
        .replace(`<@!${message.client.user.id}>`, "")
        .trim();

    if (!prompt.length)
        return message.reply(
            "💬 Pose-moi une question."
        );

    try {

        const response = await askGemini(prompt);

let thinking = await message.reply("💭 **Shiiro réfléchit...**");

const parts = [];

for (let i = 0; i < response.length; i += 1900) {
    parts.push(response.slice(i, i + 1900));
}

await thinking.edit(parts.shift());

for (const part of parts) {
    await message.reply(part);
}

} catch (err) {

    console.error(err);

    return message.reply(
        "❌ Impossible de contacter Gemini."
    );

}
};
