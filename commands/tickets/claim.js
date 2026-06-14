const ticketConfig = require("../config/tickets");

module.exports = {
    name: "claim",

    async run(message) {

        if (!message.channel.name.startsWith("ticket-")) {
            return message.reply(
                "❌ Cette commande doit être utilisée dans un ticket."
            );
        }

        if (message.channel.topic) {
            return message.reply(
                `❌ Ticket déjà réclamé par <@${message.channel.topic}>`
            );
        }

        await message.channel.setTopic(message.author.id);

        const creator = message.channel.permissionOverwrites.cache
            .filter(overwrite =>
                overwrite.allow.has("ViewChannel") &&
                !overwrite.type === 0
            );

        const allRoles = [
            "1506678765982318743",
            "1509601528242110525",
            "1506678694352261301",
            "1506696551706267688",
            "1506696757642530982",
            "1506702398029172796",
            "1506709088451690708"
        ];

        for (const roleId of allRoles) {

            await message.channel.permissionOverwrites.edit(roleId, {
                ViewChannel: false
            });

        }

        await message.channel.permissionOverwrites.edit(
            message.author.id,
            {
                ViewChannel: true,
                SendMessages: true,
                ReadMessageHistory: true
            }
        );

        message.channel.send(
            `📌 Ticket réclamé par ${message.author}`
        );
    }
};
