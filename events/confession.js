const {
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder
} = require("discord.js");

const Config = require("../models/ConfessionConfig");
const Confession = require("../models/Confession");

module.exports = async (interaction) => {

    if (interaction.isButton()) {
    if (interaction.customId === "confession_create") {

    const modal = new ModalBuilder()
        .setCustomId("confession_modal")
        .setTitle("🤫 Nouvelle confession");

    const confession = new TextInputBuilder()
        .setCustomId("confession_text")
        .setLabel("Écris ta confession")
        .setPlaceholder("Ta confession restera anonyme...")
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(true)
        .setMinLength(10)
        .setMaxLength(1500);

    modal.addComponents(
        new ActionRowBuilder().addComponents(confession)
    );

    return interaction.showModal(modal);
}
      if (interaction.customId === "confession_info") {

    return interaction.reply({
        ephemeral: true,
        embeds:            new EmbedBuilder()
                .setColor("#F4B400")
                .setTitle("ℹ️ Informations")
                .setDescription(
`🔒 Les confessions sont totalement anonymes.

• Ton identité n'est jamais affichée.
• Chaque confession reçoit un identifiant unique.
• Les abus peuvent être sanctionnés.
• Respecte les règles du serveur.`
                )
        ]
    });
  if (interaction.isModalSubmit()) {

    if (interaction.customId !== "confession_modal") return;

    const config = await Config.findOne({
        guildId: interaction.guild.id
    });

    if (!config) {
        return interaction.reply({
            content: "❌ Le système n'est pas configuré.",
            ephemeral: true
        });
    }

    const text = interaction.fields.getTextInputValue("confession_text");

    const confession = await Confession.create({
        guildId: interaction.guild.id,
        userId: interaction.user.id,
        content: text
    });

    const channel = interaction.guild.channels.cache.get(
        config.confessionChannel
    );

    if (!channel) {
        return interaction.reply({
            content: "❌ Salon de confession introuvable.",
            ephemeral: true
        });
    }

    const embed = new EmbedBuilder()
        .setColor("#2B2D31")
        .setTitle(`🤫 Confession #${confession.confessionId}`)
        .setDescription(text)
        .setFooter({
            text: "Confession anonyme"
        });

    await channel.send({
        embeds: [embed]
    });

    return interaction.reply({
        content: "✅ Ta confession a été envoyée anonymement.",
        ephemeral: true
    });

}
          }
};
