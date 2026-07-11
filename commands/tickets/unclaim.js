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
    name: "unclaim",
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

        const claimedField = panel.embeds[0]?.fields?.find(
            f => f.name === "📌 Pris en charge par"
        );

        const claimerMatch = claimedField?.value.match(/<@!?(\d+)>/);
        const claimerId = claimerMatch ? claimerMatch[1] : null;

        if (!claimedField) {
            return message.reply("❌ Ce ticket n'est pas encore pris en charge.");
        }

        if (claimerId && claimerId !== message.author.id) {
            return message.reply("❌ Seule la personne ayant pris en charge ce ticket peut l'annuler.");
        }

        const category = Object.values(TICKET_CATEGORIES).find(
            cat => cat.categoryId === message.channel.parentId
        );

        const embed = EmbedBuilder.from(panel.embeds[0]);
        embed.setFields(
            (panel.embeds[0].fields || []).filter(
                f => f.name !== "📌 Pris en charge par"
            )
        );

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId("ticket_claim")
                .setLabel("📌 Claim")
                .setStyle(ButtonStyle.Primary),

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

        if (category) {
            for (const roleId of category.staffRoles) {
                await message.channel.permissionOverwrites.edit(roleId, {
                    ViewChannel: true,
                    SendMessages: true,
                    ReadMessageHistory: true
                });
            }
        }

        await message.channel.send({
            content: `📌 ${message.author} a annulé la prise en charge de ce ticket.`
        });
    }
};
