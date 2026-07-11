const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
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

    const msg = await interaction.channel.messages.fetch(giveaway.messageId);

    const embed = EmbedBuilder.from(msg.embeds[0]);

    const emoji = giveaway.type === "casino"
        ? "<:casino:1507449727266979922>"
        : "<:nitro:1508097922489647234>";

    embed.setDescription(
`# Giveaway: ${giveaway.prize}

Cliquez sur le bouton ${emoji} pour participer
*Nombre de gagnants:* ${giveaway.winnersCount}

## Fin du giveaway
<t:${Math.floor(giveaway.endAt / 1000)}:R>`
    );

    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId(`gw_${giveaway._id}`)
            .setStyle(ButtonStyle.Secondary)
            .setEmoji(giveaway.type === "casino" ? "1507449727266979922" : "1508097922489647234")
            .setLabel(String(giveaway.participants.length))
    );

    await msg.edit({ embeds: [embed], components: [row] });

    return interaction.reply({
        content: giveaway.participants.includes(interaction.user.id)
            ? "✅ Participation enregistrée."
            : "❌ Participation retirée.",
        ephemeral: true
    });
};
