module.exports = {
    name: "unclaim",

    async run(message) {

        if (!message.channel.name.startsWith("ticket-")) {
            return message.reply(
                "❌ Cette commande doit être utilisée dans un ticket."
            );
        }

        if (!message.channel.topic) {
            return message.reply(
                "❌ Ce ticket n'est pas réclamé."
            );
        }

        if (message.channel.topic !== message.author.id) {
            return message.reply(
                `❌ Ce ticket est réclamé par <@${message.channel.topic}>`
            );
        }

        await message.channel.setTopic(null);

        message.channel.send(
            `🔓 Ticket libéré par ${message.author}`
        );
    }
};
