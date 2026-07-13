const {
    ContainerBuilder,
    TextDisplayBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder,
    MessageFlags
} = require("discord.js");
const { TICKET_CATEGORIES, LOG_CHANNEL_ID, ticketClaims, renameCooldowns } = require("../../handlers/systems/ticketHandler");

module.exports = {
    name: "close",
    async run(message, args) {

        const isTicket = Object.values(TICKET_CATEGORIES).some(
            cat => cat.categoryId === message.channel.parentId
        );

        if (!isTicket) {
            return message.reply("❌ Cette commande ne fonctionne que dans un salon ticket.");
        }

        // ⚠️ IMPORTANT : le mot de confirmation ne doit JAMAIS commencer par un
        // préfixe de commande (+, !, *, ?), sinon il serait interprété comme
        // une nouvelle invocation de +close et provoquerait une double exécution.
        await message.reply(
            "⚠️ Es-tu sûr de vouloir fermer ce ticket ?\n" +
            "Tape simplement `confirm` (sans préfixe) dans les 15 secondes pour confirmer."
        );

        const filter = m => m.author.id === message.author.id &&
            m.content.toLowerCase() === "confirm";

        const collected = await message.channel.awaitMessages({
            filter,
            max: 1,
            time: 15000
        }).catch(() => null);

        if (!collected || !collected.first()) {
            return message.channel.send("❌ Fermeture annulée (délai dépassé).");
        }

        const closeContainer = new ContainerBuilder()
            .setAccentColor(0xFFA500)
            .addTextDisplayComponents(
                new TextDisplayBuilder().setContent("## 🔒 Ticket fermé")
            )
            .addTextDisplayComponents(
                new TextDisplayBuilder().setContent(
                    "Ce ticket est fermé.\nSeul un modérateur peut désormais le supprimer."
                )
            )
            .addActionRowComponents(
                new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId("ticket_delete")
                        .setLabel("Supprimer")
                        .setEmoji("🗑️")
                        .setStyle(ButtonStyle.Danger)
                )
            );

        await message.channel.send({
            components: [closeContainer],
            flags: MessageFlags.IsComponentsV2
        });

        if (message.channel.topic) {
            await message.channel.permissionOverwrites.edit(
                message.channel.topic,
                { SendMessages: false }
            ).catch(() => {});
        }

        ticketClaims.delete(message.channel.id);
        renameCooldowns.delete(message.channel.id);

        const logChannel = message.guild.channels.cache.get(LOG_CHANNEL_ID);

        if (logChannel) {
            const logEmbed = new EmbedBuilder()
                .setColor("Red")
                .setTitle("📁 Ticket fermé")
                .addFields(
                    { name: "🎫 Ticket", value: message.channel.name, inline: true },
                    { name: "👤 Fermé par", value: `${message.author}`, inline: true }
                )
                .setTimestamp();

            await logChannel.send({ embeds: [logEmbed] });
        }
    }
};
