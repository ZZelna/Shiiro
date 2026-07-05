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

    /*
    ============================
            BOUTONS
    ============================
    */

    if (interaction.isButton()) {

        // Bouton "Confesse-toi"
        if (interaction.customId === "confession_create") {

            const modal = new ModalBuilder()
                .setCustomId("confession_modal")
                .setTitle("🤫 Nouvelle confession");

            const confessionInput = new TextInputBuilder()
                .setCustomId("confession_text")
                .setLabel("Écris ta confession")
                .setPlaceholder("Ta confession restera totalement anonyme...")
                .setStyle(TextInputStyle.Paragraph)
                .setRequired(true)
                .setMinLength(10)
                .setMaxLength(1500);

            modal.addComponents(
                new ActionRowBuilder().addComponents(confessionInput)
            );

            return interaction.showModal(modal);
        }

        // Bouton Informations
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
• Chaque confession reçoit un numéro unique.
• Les abus peuvent être sanctionnés.
• Respecte les règles du serveur.`
                        )
                ]
            });
        }
    }

    /*
    ============================
          MODAL CONFESSION
    ============================
    */

    if (!interaction.isModalSubmit()) return;

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

    if (!config.confessionChannel) {
        return interaction.reply({
            content: "❌ Aucun salon de confessions n'est configuré.",
            ephemeral: true
        });
    }

    const text = interaction.fields.getTextInputValue("confession_text");

    // Numéro de confession
    config.counter++;
    await config.save();

    // Création de la confession
    const confession = await Confession.create({
        guildId: interaction.guild.id,
        channelId: config.confessionChannel,
        authorId: interaction.user.id,
        number: config.counter,
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
        .setTitle(`🤫 Confession #${confession.number}`)
        .setDescription(confession.content)
        .setFooter({
            text: "Confession anonyme"
        });
            const embed = new EmbedBuilder()
            .setColor("#2B2D31")
            .setTitle(`🤫 Confession #${config.counter}`)
            .setDescription(text)
            .setFooter({
                text: "Confession anonyme"
            })
            .setTimestamp();

        const message = await channel.send({
            embeds: [embed]
        });

        confession.messageId = message.id;
        confession.channelId = channel.id;
        await confession.save();

        if (config.logChannel) {
            const logChannel = interaction.guild.channels.cache.get(config.logChannel);

            if (logChannel) {
                const logEmbed = new EmbedBuilder()
                    .setColor("Orange")
                    .setTitle("📜 Nouvelle confession")
                    .addFields(
                        {
                            name: "Auteur",
                            value: `${interaction.user.tag} (${interaction.user.id})`
                        },
                        {
                            name: "Confession",
                            value: text.length > 1024
                                ? text.slice(0, 1020) + "..."
                                : text
                        },
                        {
                            name: "Numéro",
                            value: `#${config.counter}`
                        }
                    )
                    .setTimestamp();

                await logChannel.send({
                    embeds: [logEmbed]
                });
            }
        }

        return interaction.reply({
            content: "✅ Ta confession a été envoyée anonymement.",
            ephemeral: true
        });
    }

};
