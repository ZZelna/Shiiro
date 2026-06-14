const ticketConfig = require("../config/tickets");

const claimModule = require("./claim");

module.exports = {
name: "unclaim",

    async run(message) {

        await message.channel.fetch();

        if (!message.channel.name.startsWith("ticket-")) {
            return message.reply("❌ Cette commande doit être utilisée dans un ticket.");
        }

        if (!message.channel.topic) {
            return message.reply(
                "❌ Ce ticket n'est pas réclamé."
            );
        }

        await message.channel.setTopic(null);

        await message.channel.fetch();

        return message.channel.send(
            `🔓 Ticket libéré par ${message.author}`
        );
    }
};
