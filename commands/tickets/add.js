module.exports = {
    name: "add",

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
                "❌ Utilisation : +add ID_DISCORD"
            );
        }

        try {

            await message.channel.permissionOverwrites.edit(
                userId,
                {
                    ViewChannel: true,
                    SendMessages: true,
                    ReadMessageHistory: true
                }
            );

            return message.channel.send(
                `✅ <@${userId}> a été ajouté au ticket.`
            );

        } catch {

            return message.reply(
                "❌ ID invalide."
            );
        }
    }
};
