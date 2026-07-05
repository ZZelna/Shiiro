const {
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    ActionRowBuilder,
    EmbedBuilder
} = require("discord.js");

const Config = require("../models/ConfessionConfig");
const Confession = require("../models/Confession");

module.exports = async (interaction) => {

    // =========================
    // BOUTONS
    // =========================
    if (interaction.isButton()) {

        // Ouvrir le modal
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

        // Informations
        if (interaction.customId === "confession_info") {

            return interaction.reply({
                ephemeral: true,
                embeds: [
                    new EmbedBuilder()
                        .setColor("#F4B400")
                        .setTitle("ℹ️ Informations")
                        .setDescription(
`🔒 Les confessions sont totalement anonymes.

• Ton identité n'est jamais affichée.
• Chaque confession possède un identifiant unique.
• Les abus peuvent être sanctionnés.
• Respecte les règles du serveur.`
                        )
                ]
            });

        }

    }

    // =========================
    // MODAL
    // =========================
    if (interaction.isModalSubmit()) {

        if (interaction.customId !== "confession_modal") return;

        const config = await Config.findOne({
            guildId: interaction.guild.id
        });

        if (!config) {
            return interaction.reply({
                content: "❌ Le système de confessions n'est pas configuré.",
                ephemeral: true
            });
        }

        const text = interaction.fields.getTextInputValue("confession_text");

        const count = await Confession.countDocuments({
            guildId: interaction.guild.id
        });

        const confession = await Confession.create({
            guildId: interaction.guild.id,
            channelId: config.confessionChannel,
            authorId: interaction.user.id,
            number: count + 1,
            content: text
        });

        const channel = interaction.guild.channels.cache.get(
            config.confessionChannel
        );

        if (!channel) {
            return interaction.reply({
                content: "❌ Salon des confessions introuvable.",
                ephemeral: true
            });
        }

        const embed = new EmbedBuilder()
            .setColor("#2B2D31")
            .setTitle(`🤫 Confession #${confession.number}`)
            .setDescription(confession.content)
            .setFooter({
                text: "Confession anonyme"
            })
            .setTimestamp();

        const message = await channel.send({
            embeds: [embed]
        });

        confession.messageId = message.id;
        await confession.save();

        return interaction.reply({
            content: "✅ Ta confession a été envoyée anonymement.",
            ephemeral: true
        });

    }

};
