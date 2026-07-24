const config = require("../config/logger");

async function send(client, type, content) {
    const channelId = config.channels[type];
    if (!channelId) return;

    const channel = await client.channels.fetch(channelId).catch(() => null);
    if (!channel) return;

    return channel.send({
        content: `\`\`\`txt\n${content}\n\`\`\``
    });
}

function separator() {
    return "────────────────────────";
}

function user(user) {
    return `👤 Utilisateur : ${user.tag} (${user.id})`;
}

function guild(guild) {
    return `🏠 Serveur    : ${guild.name}`;
}

function channel(channel) {
    return `💬 Salon      : #${channel.name}`;
}

module.exports = {
    send,
    separator,
    user,
    guild,
    channel
};
