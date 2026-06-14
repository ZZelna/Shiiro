module.exports = {
    name: "claim",

    async run(message) {

        if (!message.channel.name.startsWith("ticket-")) {
            return message.reply("❌ Cette commande doit être utilisée dans un ticket.");
        }

        await message.channel.fetch();

        if (message.channel.topic) {
            return message.reply(
                `❌ Ticket déjà réclamé par <@${message.channel.topic}>`
            );
        }

        await message.channel.setTopic(message.author.id);

        return message.channel.send(
            `📌 Ticket réclamé par ${message.author}`
        );
    }
};
