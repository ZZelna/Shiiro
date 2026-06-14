module.exports = {
    name: "close",

    async run(message) {

        if (!message.channel.name.startsWith("ticket-")) {
            if (
    message.channel.topic &&
    message.channel.topic !== message.author.id
) {
    return message.reply(
        `❌ Ticket réclamé par <@${message.channel.topic}>`
    );
}
            return message.reply("❌ Cette commande doit être utilisée dans un ticket.");
        }

        await message.channel.send(
            "🔒 Fermeture du ticket dans 5 secondes..."
        );

        setTimeout(async () => {

            await message.channel.delete()
                .catch(() => {});

        }, 5000);
    }
};
