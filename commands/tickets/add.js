const { TICKET_CATEGORIES } = require("../../handlers/systems/ticketHandler");

module.exports = {
    name: "add",
    async run(message, args) {

        const isTicket = Object.values(TICKET_CATEGORIES).some(
            cat => cat.categoryId === message.channel.parentId
        );

        if (!isTicket) {
            return message.reply("❌ Cette commande ne fonctionne que dans un salon ticket.");
        }

        const member = message.mentions.members.first();

        if (!member) {
            return message.reply("❌ Utilisation : `+add @membre`");
        }

        await message.channel.permissionOverwrites.edit(member.id, {
            ViewChannel: true,
            SendMessages: true,
            ReadMessageHistory: true
        });

        return message.channel.send({
            content: `✅ ${member} a été ajouté au ticket.`
        });
    }
};
