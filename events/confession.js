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
    ==========================================
                BOUTONS
    ==========================================
    */

    if (interaction.isButton()) {

        // Ouvrir le formulaire
        if (interaction.customId === "confession_create") {

            const modal = new ModalBuilder()
                .setCustomId("confession_modal")
                .setTitle("🤫 Nouvelle confession");

            const input = new TextInputBuilder()
                .setCustomId("confession_text")
                .setLabel("Écris ta confession")
                .setPlaceholder("Cette confession restera anonyme...")
                .setStyle(TextInputStyle.Paragraph)
                .setRequired(true)
                .setMinLength(10)
                .setMaxLength(1500);

            modal.addComponents(
                new ActionRowBuilder().addComponents(input)
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
`🔒 Les confessions sont anonymes.

• Les modérateurs voient l'auteur uniquement lors de la validation.
• Les autres membres ne verront jamais ton identité.
• Les abus peuvent entraîner une sanction.`
                        )
                ]
            });

        }
                // Validation
        if (interaction.customId.startsWith("confession_accept_")) {

            const confessionId = interaction.customId.replace(
                "confession_accept_",
                ""
            );

            const confession = await Confession.findById(confessionId);

            if (!confession) {
                return interaction.reply({
                    content: "❌ Confession introuvable.",
                    ephemeral: true
                });
            }

            const config = await Config.findOne({
                guildId: interaction.guild.id
            });

            const channel = interaction.guild.channels.cache.get(
                config.confessionChannel
            );

            if (!channel) {
                return interaction.reply({
                    content: "❌ Salon introuvable.",
                    ephemeral: true
                });
            }

            const confessionEmbed = new EmbedBuilder()
                .setColor("#2B2D31")
                .setTitle(`🤫 Confession #${confession.number}`)
                .setDescription(confession.content)
                .setFooter({
                    text: "Confession anonyme"
                })
                .setTimestamp();

            const row = new ActionRowBuilder().addComponents(

                new ButtonBuilder()
                    .setCustomId(`confession_like_${confession._id}`)
                    .setEmoji("👍")
                    .setLabel("0")
                    .setStyle(ButtonStyle.Success),

                new ButtonBuilder()
                    .setCustomId(`confession_dislike_${confession._id}`)
                    .setEmoji("👎")
                    .setLabel("0")
                    .setStyle(ButtonStyle.Danger),

                new ButtonBuilder()
                    .setCustomId(`confession_reply_${confession._id}`)
                    .setEmoji("💬")
                    .setLabel("Répondre")
                    .setStyle(ButtonStyle.Primary),

                new ButtonBuilder()
                    .setCustomId(`confession_report_${confession._id}`)
                    .setEmoji("🚨")
                    .setLabel("Signaler")
                    .setStyle(ButtonStyle.Secondary)

            );

            const message = await channel.send({
                embeds: [confessionEmbed],
                components: [row]
            });

            confession.messageId = message.id;
            confession.channelId = channel.id;

            await confession.save();

            return interaction.update({
                content: "✅ Confession publiée.",
                embeds: [],
                components: []
            });

        }
                // Refuser une confession
        if (interaction.customId.startsWith("confession_refuse_")) {

            const confessionId = interaction.customId.replace(
                "confession_refuse_",
                ""
            );

            const confession = await Confession.findById(confessionId);

            if (!confession) {
                return interaction.reply({
                    content: "❌ Confession introuvable.",
                    ephemeral: true
                });
            }

            confession.deleted = true;
            await confession.save();

            return interaction.update({
                content: "❌ Confession refusée.",
                embeds: [],
                components: []
            });

        }

        // Blacklist d'un utilisateur
        if (interaction.customId.startsWith("confession_blacklist_")) {

            const userId = interaction.customId.replace(
                "confession_blacklist_",
                ""
            );

            const config = await Config.findOne({
                guildId: interaction.guild.id
            });

            if (!config.blacklist.includes(userId)) {
                config.blacklist.push(userId);
                await config.save();
            }

            return interaction.reply({
                content: `🔨 <@${userId}> a été blacklisté du système de confessions.`,
                ephemeral: true
            });

        }

    }

    /*
    ==========================================
                MODAL
    ==========================================
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

    // Vérifie la blacklist
    if (config.blacklist.includes(interaction.user.id)) {
        return interaction.reply({
            content: "❌ Tu es blacklisté du système de confessions.",
            ephemeral: true
        });
    }

    const text = interaction.fields.getTextInputValue("confession_text");

    // Numéro automatique
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

    // Si aucun salon de logs n'est configuré
    if (!config.logChannel) {
        return interaction.reply({
            content: "❌ Aucun salon de modération configuré.",
            ephemeral: true
        });
    }

    const logChannel = interaction.guild.channels.cache.get(config.logChannel);

    if (!logChannel) {
        return interaction.reply({
            content: "❌ Salon de modération introuvable.",
            ephemeral: true
        });
    }

    const moderationEmbed = new EmbedBuilder()
        .setColor("Orange")
        .setTitle(`📝 Confession #${confession.number}`)
        .setDescription(confession.content)
        .addFields(
            {
                name: "Auteur",
                value: `${interaction.user.tag}\n\`${interaction.user.id}\``
            },
            {
                name: "Statut",
                value: "⏳ En attente de validation"
            }
        )
        .setTimestamp();

    const moderationRow = new ActionRowBuilder().addComponents(

        new ButtonBuilder()
            .setCustomId(`confession_accept_${confession._id}`)
            .setLabel("Publier")
            .setEmoji("✅")
            .setStyle(ButtonStyle.Success),

        new ButtonBuilder()
            .setCustomId(`confession_refuse_${confession._id}`)
            .setLabel("Refuser")
            .setEmoji("❌")
            .setStyle(ButtonStyle.Danger),

        new ButtonBuilder()
            .setCustomId(`confession_blacklist_${confession.authorId}`)
            .setLabel("Blacklist")
            .setEmoji("🔨")
            .setStyle(ButtonStyle.Secondary)

    );

    await logChannel.send({
        embeds: [moderationEmbed],
        components: [moderationRow]
    });

    return interaction.reply({
        content: "✅ Ta confession a été envoyée aux modérateurs pour validation.",
        ephemeral: true
    });

};
