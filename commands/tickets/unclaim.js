const ticketConfig = require("../config/tickets");

module.exports = {
    name: "unclaim",

    async run(message) {

        if (!message.channel.topic) {
            return message.reply(
                "❌ Ce ticket n'est pas réclamé."
            );
        }

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
                ViewChannel: true,
                SendMessages: true,
                ReadMessageHistory: true
            });

        }

        await message.channel.setTopic(null);

        message.channel.send(
            `🔓 Ticket libéré par ${message.author}`
        );
    }
};
