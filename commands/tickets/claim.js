const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { TICKET_CATEGORIES } = require("../../handlers/systems/ticketHandler");

async function findPanelMessage(channel) {
    // 1. Priorité : messages épinglés (fiable quel que soit l'historique du salon)
    const pinned = await channel.messages.fetchPinned().catch(() => null);
    const pinnedPanel = pinned?.find(m =>
        m.author.id === channel.client.user.id &&
        m.components.length &&
        m.components[0].components.some(c =>
            ["ticket_claim", "ticket_unclaim"].includes(c.customId)
        )
    );
    if (pinnedPanel) return pinnedPanel;

    // 2. Fallback : scan des 100 derniers messages
    const messages = await channel.messages.fetch({ limit: 100 });
    return messages.find(m =>
        m.author.id === channel.client.user.id &&
        m.components.length &&
        m.components[0].components.some(c =>
            ["ticket_claim", "ticket_unclaim"].includes(c.customId)
        )
    );
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

        const panel = await findPanelMessage(message.channel);

        if (!panel) {
            return message.reply("❌ Message du panel introuvable dans ce salon.");
        }

        const claimButton = panel.components[0].components.find(
            c => c.customId === "ticket_claim"
        );

        if (!claimButton) {
            return message.reply("❌ Ce ticket est déjà pris en charge.");
        }

        const category = Object.values(TICKET_CATEGORIES).find(
            cat => cat.categoryId === message.channel.parentId
        );

        const embed = EmbedBuilder.from(panel.embeds[0]);
        embed.addFields({
            name: "📌 Pris en charge par",
            value: `${message.author}`,
            inline: false
        });

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId("ticket_unclaim")
                .setLabel(`📌 ${message.author.username}`)
                .setStyle(ButtonStyle.Success),

            new ButtonBuilder()
                .setCustomId("ticket_add")
                .setLabel("➕ Ajouter")
                .setStyle(ButtonStyle.Primary),

            new ButtonBuilder()
                .setCustomId("ticket_remove")
                .setLabel("➖ Retirer")
                .setStyle(ButtonStyle.Secondary),

            new ButtonBuilder()
                .setCustomId("ticket_rename")
                .setLabel("✏️ Renommer")
                .setStyle(ButtonStyle.Secondary),

            new ButtonBuilder()
                .setCustomId("ticket_close")
                .setLabel("🔒 Fermer")
                .setStyle(ButtonStyle.Danger)
        );

        await panel.edit({ embeds: [embed], components: [row] });

        await message.channel.permissionOverwrites.edit(message.author.id, {
            ViewChannel: true,
            SendMessages: true
        });

        if (category) {
            for (const roleId of category.staffRoles) {
                await message.channel.permissionOverwrites.edit(roleId, {
                    ViewChannel: false
                });
            }
        }

        await message.channel.send({
            content: `📌 ${message.author} prend désormais ce ticket en charge.`
        });
    }
};
