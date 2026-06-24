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

        const channel =
            message.guild.channels.cache.get(
                LOG_CHANNEL
            );

        if (!channel)
            return;

       await channel.send({
    content: `\`\`\`diff
- Message supprimé.
Utilisateur: ${message.author?.tag}
Contenu:
${shorten(message.content)}
\`\`\``
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

        const channel =
            oldMessage.guild.channels.cache.get(
                LOG_CHANNEL
            );

        if (!channel)
            return;

        await channel.send({
    content: `\`\`\`diff
~ Message modifié.
Utilisateur: ${oldMessage.author.tag}

Ancien:
${shorten(oldMessage.content)}

Nouveau:
${shorten(newMessage.content)}
\`\`\``
});
    }
);
};
