const { TICKET_CATEGORIES } = require("../../handlers/systems/ticketHandler");

module.exports = {
    name: "remove",
    async run(message, args) {

        const isTicket = Object.values(TICKET_CATEGORIES).some(
            cat => cat.categoryId === message.channel.parentId
        );

        if (!isTicket) {
            return message.reply("❌ Cette commande ne fonctionne que dans un salon ticket.");
        }

        const member = message.mentions.members.first();

        if (!member) {
            return message.reply("❌ Utilisation : `+remove @membre`");
        }

        await message.channel.permissionOverwrites.delete(member.id);

        return message.channel.send({
            content: `✅ ${member} a été retiré du ticket.`
        });
    }
};
