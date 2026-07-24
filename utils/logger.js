const config = require("../config/logger");

async function send(client, type, content) {
    try {
        const channelId = config.channels[type];
        if (!channelId) return;

        const channel = await client.channels.fetch(channelId).catch(() => null);
        if (!channel) return;

        await channel.send({
            content: `\`\`\`txt\n${content}\n\`\`\``
        });

    } catch (err) {
        console.error("[LOGGER]", err);
    }
}

module.exports = {
    send
};
