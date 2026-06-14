const ticketConfig = require("../config/tickets");

module.exports = {
    name: "unclaim",

    async run(message) {

        console.log("TOPIC :", message.channel.topic);
        console.log("AUTHOR :", message.author.id);

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

        await message.channel.setTopic(null);

        return message.channel.send(
            `🔓 Ticket libéré par ${message.author}`
        );
    }
};
