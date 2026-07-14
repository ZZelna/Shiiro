const {
    ButtonBuilder,
    ButtonStyle,
    ActionRowBuilder,
    ContainerBuilder,
    TextDisplayBuilder,
    MessageFlags
} = require("discord.js");
const Giveaway = require("../../models/Giveaway");

module.exports = async function handleGiveawayInteraction(interaction) {

    if (!interaction.isButton() || !interaction.customId.startsWith("gw_")) return;

    const giveawayId = interaction.customId.replace("gw_", "");

    const giveaway = await Giveaway.findById(giveawayId);

    if (!giveaway) {
        return interaction.reply({ content: "❌ Giveaway introuvable.", ephemeral: true });
    }

    if (giveaway.ended) {
        return interaction.reply({ content: "❌ Ce giveaway est terminé.", ephemeral: true });
    }

    if (giveaway.participants.includes(interaction.user.id)) {
        giveaway.participants = giveaway.participants.filter(id => id !== interaction.user.id);
    } else {
        giveaway.participants.push(interaction.user.id);
    }

    await giveaway.save();

    const emoji = giveaway.type === "casino"
        ? "<:casino:1507449727266979922>"
        : "<:nitro:1508097922489647234>";

    const container = new ContainerBuilder()
        .setAccentColor(0x0000FF)
        .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
                `# Giveaway: ${giveaway.prize}\n\n` +
                `Cliquez sur le bouton ${emoji} pour participer\n` +
                `*Nombre de gagnants:* ${giveaway.winnersCount}\n\n` +
                `## Fin du giveaway\n` +
                `<t:${Math.floor(giveaway.endAt / 1000)}:R>`
            )
        )
        .addActionRowComponents(
            new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId(`gw_${giveaway._id}`)
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji(giveaway.type === "casino" ? "1507449727266979922" : "1508097922489647234")
                    .setLabel(String(giveaway.participants.length))
            )
        );

    const msg = await interaction.channel.messages.fetch(giveaway.messageId);

    await msg.edit({
        components: [container],
        flags: MessageFlags.IsComponentsV2
    });

    return interaction.reply({
        content: giveaway.participants.includes(interaction.user.id)
            ? "✅ Participation enregistrée."
            : "❌ Participation retirée.",
        ephemeral: true
    });
};
