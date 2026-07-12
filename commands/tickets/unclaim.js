const { TextDisplayBuilder, MessageFlags } = require("discord.js");
const {
    TICKET_CATEGORIES,
    ticketClaims,
    buildTicketContainer,
    getStaffMentionLine
} = require("../../handlers/systems/ticketHandler");

async function findPanelMessage(channel) {
    const pinned = await channel.messages.fetchPinned().catch(() => null);
    const pinnedPanel = pinned?.find(m => m.author.id === channel.client.user.id);
    if (pinnedPanel) return pinnedPanel;

    const messages = await channel.messages.fetch({ limit: 100 });
    return messages.find(m => m.author.id === channel.client.user.id && m.components.length);
}

module.exports = {
    name: "unclaim",
    async run(message, args) {

        const isTicket = Object.values(TICKET_CATEGORIES).some(
            cat => cat.categoryId === message.channel.parentId
        );

        if (!isTicket) {
            return message.reply("❌ Cette commande ne fonctionne que dans un salon ticket.");
        }

        const claimerId = ticketClaims.get(message.channel.id);

        if (!claimerId) {
            return message.reply("❌ Ce ticket n'est pas pris en charge.");
        }

        if (claimerId !== message.author.id) {
            return message.reply("❌ Seule la personne ayant pris en charge ce ticket peut l'annuler.");
        }

        const category = Object.values(TICKET_CATEGORIES).find(
            cat => cat.categoryId === message.channel.parentId
        );

        const panel = await findPanelMessage(message.channel);

        if (!panel) {
            return message.reply("❌ Message du panel introuvable dans ce salon.");
        }

        ticketClaims.delete(message.channel.id);

        const creatorId = message.channel.topic;
        const mentionLine = new TextDisplayBuilder().setContent(
            getStaffMentionLine(category, creatorId)
        );
        const container = buildTicketContainer(category, creatorId, null);

        await panel.edit({
            components: [mentionLine, container],
            flags: MessageFlags.IsComponentsV2
        });

        for (const roleId of category.staffRoles) {
            await message.channel.permissionOverwrites.edit(roleId, {
                ViewChannel: true,
                SendMessages: true,
                ReadMessageHistory: true
            });
        }

        await message.channel.send({
            content: `📌 ${message.author} a annulé la prise en charge de ce ticket.`
        });
    }
};
