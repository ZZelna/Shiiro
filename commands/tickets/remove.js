module.exports = {
    name: "remove",

    async run(message, args) {

        if (!message.channel.name.startsWith("ticket-")) {
            return message.reply(
                "❌ Cette commande doit être utilisée dans un ticket."
            );
        }

        if (
            message.channel.topic &&
            message.channel.topic !== message.author.id
        ) {
            return message.reply(
                `❌ Ticket réclamé par <@${message.channel.topic}>`
            );
        }

        const userId = args[0];

        if (!userId) {
            return message.reply(
                "❌ Utilisation : +remove ID_DISCORD"
            );
        }

        try {

            await message.channel.permissionOverwrites.delete(
                userId
            );

            return message.channel.send(
                `❌ <@${userId}> a été retiré du ticket.`
            );

        } catch {

            return message.reply(
                "❌ ID invalide."
            );
        }
    }
};
