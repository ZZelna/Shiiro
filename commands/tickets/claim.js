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
    name: "claim",
    async run(message, args) {

        const isTicket = Object.values(TICKET_CATEGORIES).some(
            cat => cat.categoryId === message.channel.parentId
        );

        if (!isTicket) {
            return message.reply("❌ Cette commande ne fonctionne que dans un salon ticket.");
        }

        if (ticketClaims.get(message.channel.id)) {
            return message.reply("❌ Ce ticket est déjà pris en charge.");
        }

        const category = Object.values(TICKET_CATEGORIES).find(
            cat => cat.categoryId === message.channel.parentId
        );

        const panel = await findPanelMessage(message.channel);

        if (!panel) {
            return message.reply("❌ Message du panel introuvable dans ce salon.");
        }

        ticketClaims.set(message.channel.id, message.author.id);

        const creatorId = message.channel.topic;
        const mentionLine = new TextDisplayBuilder().setContent(
            getStaffMentionLine(category, creatorId)
        );
        const container = buildTicketContainer(category, creatorId, message.author.id);

        await panel.edit({
            components: [mentionLine, container],
            flags: MessageFlags.IsComponentsV2
        });

        await message.channel.permissionOverwrites.edit(message.author.id, {
            ViewChannel: true,
            SendMessages: true
        });

        for (const roleId of category.staffRoles) {
            await message.channel.permissionOverwrites.edit(roleId, {
                ViewChannel: false
            });
        }

        await message.channel.send({
            content: `📌 ${message.author} prend désormais ce ticket en charge.`
        });
    }
};
