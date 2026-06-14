const ticketConfig = require("../config/tickets");

const claimCooldown = new Map();

module.exports = {
    name: "claim",
    claimCooldown,

    async run(message) {

        await message.channel.fetch();

        if (!message.channel.name.startsWith("ticket-")) {
            return message.reply("❌ Cette commande doit être utilisée dans un ticket.");
        }

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
