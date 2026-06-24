const LOG_GUILD =
"1519364880677867550";

const LOG_CHANNEL =
"1519366440375812246";

module.exports = (client) => {
function shorten(text) {

    if (!text)
        return "Aucun contenu";

    if (text.length > 1500) {

        return (
            text.slice(0, 1500) +
            "\n...[message trop long]"
        );

    }

    return text;

}

client.on(
    "messageDelete",
    async message => {

        if (!message.guild)
            return;

        if (
            message.author?.bot
        )
            return;

        const logGuild =
            client.guilds.cache.get(
                LOG_GUILD
            );

        if (!logGuild)
            return;

        const channel =
            logGuild.channels.cache.get(
                LOG_CHANNEL
            );

        if (!channel)
            return;

        const attachment =
message.attachments.first();

await channel.send({
    content: `\`\`\`diff
- Message supprimé.
Utilisateur: ${message.author?.tag || "Inconnu"} (ID: ${message.author?.id || "Inconnu"})
Serveur: ${message.guild.name}
Salon: #${message.channel.name}

Contenu:
${shorten(message.content)}
\`\`\``,
    files: attachment
        ? [attachment.url]
        : []
});
  }
);
client.on(
    "messageUpdate",
    async (
        oldMessage,
        newMessage
    ) => {

        if (!oldMessage.guild)
            return;

        if (
            oldMessage.author?.bot
        )
            return;

        if (
            oldMessage.content ===
            newMessage.content
        )
            return;

        const logGuild =
            client.guilds.cache.get(
                LOG_GUILD
            );

        if (!logGuild)
            return;

        const channel =
            logGuild.channels.cache.get(
                LOG_CHANNEL
            );

        if (!channel)
            return;

        const attachment =
newMessage.attachments.first()
|| oldMessage.attachments.first();

await channel.send({
    content: `\`\`\`diff
~ Message modifié.
Utilisateur: ${oldMessage.author.tag} (ID: ${oldMessage.author.id})
Serveur: ${oldMessage.guild.name}
Salon: #${oldMessage.channel.name}

Ancien:
${shorten(oldMessage.content)}

Nouveau:
${shorten(newMessage.content)}
\`\`\``,
    files: attachment
        ? [attachment.url]
        : []
});
);
};
