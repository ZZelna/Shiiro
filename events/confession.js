const {
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder,
    ContainerBuilder,
    TextDisplayBuilder,
    SectionBuilder,
    ThumbnailBuilder,
    SeparatorBuilder,
    SeparatorSpacingSize,
    MessageFlags
} = require("discord.js");

const Config = require("../models/ConfessionConfig");
const Confession = require("../models/Confession");

/*
==========================================
    HELPERS (évite la duplication)
==========================================
*/

function buildPopularity(confession) {
    const likes = confession.likes.length;
    const dislikes = confession.dislikes.length;
    const total = likes + dislikes;
    const percent = total === 0 ? 0 : Math.round((likes / total) * 100);
    const bars = Math.round(percent / 10);

    return "🟩".repeat(bars) + "⬜".repeat(10 - bars);
}

function buildStyle(confession) {
    const likes = confession.likes.length;

    let color = 0x5865F2;
    let badge = "🤫";

    if (likes >= 100) {
        color = 0x9B59B6;
        badge = "👑";
    } else if (likes >= 50) {
        color = 0xF1C40F;
        badge = "🔥";
    } else if (likes >= 25) {
        color = 0x2ECC71;
        badge = "⭐";
    }

    return { color, badge };
}

// ─── Construction du container V2 (remplace buildConfessionEmbed) ───────────
function buildConfessionContainer(confession, guild) {
    const { color, badge } = buildStyle(confession);
    const popularity = buildPopularity(confession);
    const iconURL = guild.iconURL({ dynamic: true });

    const container = new ContainerBuilder().setAccentColor(color);

    // ─── En-tête (avec miniature si le serveur a une icône) ─────────────────
    if (iconURL) {
        container.addSectionComponents(
            new SectionBuilder()
                .addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(`${badge} **CONFESSIONS NOCTURNE**`),
                    new TextDisplayBuilder().setContent(`## Confession #${confession.number}`)
                )
                .setThumbnailAccessory(
                    thumbnail => thumbnail.setURL(iconURL)
                )
        );
    } else {
        container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(`${badge} **CONFESSIONS NOCTURNE**`),
            new TextDisplayBuilder().setContent(`## Confession #${confession.number}`)
        );
    }

    container.addSeparatorComponents(
        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
    );

    container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`> ${confession.content}`)
    );

    container.addSeparatorComponents(
        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
    );

    container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
            `❤️ **Popularité**\n${popularity}\n\n` +
            `👍 **${confession.likes.length}** likes　` +
            `👎 **${confession.dislikes.length}** dislikes　` +
            `💬 **${confession.replies.length}** réponses`
        )
    );

    container.addSeparatorComponents(
        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
    );

    container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
            `-# ${guild.name} • Confession totalement anonyme`
        )
    );

    container.addActionRowComponents(
        buildConfessionButtonsRow(confession)
    );

    return container;
}

function buildConfessionButtonsRow(confession) {
    return new ActionRowBuilder().addComponents(

        new ButtonBuilder()
            .setCustomId(`confession_like_${confession._id}`)
            .setEmoji("👍")
            .setLabel(`${confession.likes.length}`)
            .setStyle(ButtonStyle.Success),

        new ButtonBuilder()
            .setCustomId(`confession_dislike_${confession._id}`)
            .setEmoji("👎")
            .setLabel(`${confession.dislikes.length}`)
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
}

module.exports = async (interaction) => {

    /*
    ==========================================
                    BOUTONS
    ==========================================
    */

    if (interaction.isButton()) {

        /*
        =========================
        OUVRIR LE MODAL
        =========================
        */

        if (interaction.customId === "confession_create") {

            const modal = new ModalBuilder()
                .setCustomId("confession_modal")
                .setTitle("🤫 Nouvelle confession");

            const input = new TextInputBuilder()
                .setCustomId("confession_text")
                .setLabel("Écris ta confession")
                .setPlaceholder("Cette confession restera totalement anonyme...")
                .setStyle(TextInputStyle.Paragraph)
                .setRequired(true)
                .setMinLength(10)
                .setMaxLength(1500);

            modal.addComponents(
                new ActionRowBuilder().addComponents(input)
            );

            return interaction.showModal(modal);
        }

        /*
        =========================
        INFORMATIONS
        =========================
        */

        if (interaction.customId === "confession_info") {

            const infoContainer = new ContainerBuilder()
                .setAccentColor(0xF4B400)
                .addTextDisplayComponents(
                    new TextDisplayBuilder().setContent("## ℹ️ Informations")
                )
                .addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(
                        `🔒 Les confessions sont totalement anonymes.\n\n` +
                        `• Les modérateurs voient uniquement l'auteur pendant la validation.\n` +
                        `• Les autres membres ne verront jamais ton identité.\n` +
                        `• Tu peux liker, répondre ou signaler une confession.\n` +
                        `• Les abus peuvent entraîner une sanction.`
                    )
                );

            return interaction.reply({
                components: [infoContainer],
                flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral
            });
        }

        /*
        =========================
        PUBLIER UNE CONFESSION
        =========================
        */

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

            if (!config) {
                return interaction.reply({
                    content: "❌ Le système de confessions n'est pas configuré.",
                    ephemeral: true
                });
            }

            const channel = interaction.guild.channels.cache.get(
                config.confessionChannel
            );

            if (!channel) {
                return interaction.reply({
                    content: "❌ Salon de confession introuvable.",
                    ephemeral: true
                });
            }

            confession.status = "approved";
            await confession.save();

            const container = buildConfessionContainer(confession, interaction.guild);

            const message = await channel.send({
                components: [container],
                flags: MessageFlags.IsComponentsV2
            });

            // Création du thread
            const thread = await message.startThread({
                name: `💬 Discussions - Confession #${confession.number}`,
                autoArchiveDuration: 1440
            });

            const welcomeContainer = new ContainerBuilder()
                .setAccentColor(buildStyle(confession).color)
                .addTextDisplayComponents(
                    new TextDisplayBuilder().setContent("## 💬 Bienvenue dans la discussion")
                )
                .addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(
                        `Bienvenue dans le thread de cette confession.\n\n` +
                        `📜 **Règles**\n\n` +
                        `• Respectez tous les membres.\n` +
                        `• Pas d'insultes.\n` +
                        `• Pas de spam.\n` +
                        `• Les réponses restent anonymes.\n` +
                        `• Les modérateurs surveillent ce fil.\n\n` +
                        `Bonne discussion ❤️`
                    )
                );

            await thread.send({
                components: [welcomeContainer],
                flags: MessageFlags.IsComponentsV2
            });

            confession.messageId = message.id;
            confession.channelId = channel.id;
            confession.threadId = thread.id;

            await confession.save();

            return interaction.update({
                content: "✅ Confession publiée avec succès.",
                embeds: [],
                components: []
            });

        }

        /*
        =========================
        REFUSER UNE CONFESSION
        =========================
        */

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

            confession.status = "refused";
            confession.deleted = true;

            await confession.save();

            return interaction.update({
                content: "❌ Confession refusée.",
                embeds: [],
                components: []
            });

        }

        /*
        =========================
        BLACKLIST
        =========================
        */

        if (interaction.customId.startsWith("confession_blacklist_")) {

            const userId = interaction.customId.replace(
                "confession_blacklist_",
                ""
            );

            const config = await Config.findOne({
                guildId: interaction.guild.id
            });

            if (!config) {
                return interaction.reply({
                    content: "❌ Le système de confessions n'est pas configuré.",
                    ephemeral: true
                });
            }

            if (!config.blacklist.includes(userId)) {
                config.blacklist.push(userId);
                await config.save();
            }

            return interaction.reply({
                content: `🔨 <@${userId}> a été blacklisté du système de confessions.`,
                ephemeral: true
            });

        }

        /*
        =========================
        LIKE
        =========================
        */

        if (interaction.customId.startsWith("confession_like_")) {

            const confessionId = interaction.customId.replace(
                "confession_like_",
                ""
            );

            const confession = await Confession.findById(confessionId);

            if (!confession) {
                return interaction.reply({
                    content: "❌ Confession introuvable.",
                    ephemeral: true
                });
            }

            if (confession.likes.includes(interaction.user.id)) {

                confession.likes.pull(interaction.user.id);

            } else {

                confession.likes.push(interaction.user.id);

                if (confession.dislikes.includes(interaction.user.id)) {
                    confession.dislikes.pull(interaction.user.id);
                }

            }

            await confession.save();

            const container = buildConfessionContainer(confession, interaction.guild);

            return interaction.update({
                components: [container],
                flags: MessageFlags.IsComponentsV2
            });

        }

        /*
        =========================
        DISLIKE
        =========================
        */

        if (interaction.customId.startsWith("confession_dislike_")) {

            const confessionId = interaction.customId.replace(
                "confession_dislike_",
                ""
            );

            const confession = await Confession.findById(confessionId);

            if (!confession) {
                return interaction.reply({
                    content: "❌ Confession introuvable.",
                    ephemeral: true
                });
            }

            if (confession.dislikes.includes(interaction.user.id)) {

                confession.dislikes.pull(interaction.user.id);

            } else {

                confession.dislikes.push(interaction.user.id);

                if (confession.likes.includes(interaction.user.id)) {
                    confession.likes.pull(interaction.user.id);
                }

            }

            await confession.save();

            const container = buildConfessionContainer(confession, interaction.guild);

            return interaction.update({
                components: [container],
                flags: MessageFlags.IsComponentsV2
            });

        }

        /*
        =========================
        RÉPONDRE À UNE CONFESSION
        =========================
        */

        if (interaction.customId.startsWith("confession_reply_")) {

            const confessionId = interaction.customId.replace(
                "confession_reply_",
                ""
            );

            const modal = new ModalBuilder()
                .setCustomId(`reply_modal_${confessionId}`)
                .setTitle("💬 Répondre à la confession");

            const input = new TextInputBuilder()
                .setCustomId("reply_text")
                .setLabel("Votre réponse")
                .setStyle(TextInputStyle.Paragraph)
                .setPlaceholder("Écris une réponse anonyme...")
                .setRequired(true)
                .setMinLength(3)
                .setMaxLength(500);

            modal.addComponents(
                new ActionRowBuilder().addComponents(input)
            );

            return interaction.showModal(modal);

        }

        /*
        =========================
        SIGNALER UNE CONFESSION
        =========================
        */

        if (interaction.customId.startsWith("confession_report_")) {

            const confessionId = interaction.customId.replace(
                "confession_report_",
                ""
            );

            const confession = await Confession.findById(confessionId);

            if (!confession) {
                return interaction.reply({
                    content: "❌ Confession introuvable.",
                    ephemeral: true
                });
            }

            if (confession.reports.includes(interaction.user.id)) {
                return interaction.reply({
                    content: "❌ Tu as déjà signalé cette confession.",
                    ephemeral: true
                });
            }

            confession.reports.push(interaction.user.id);
            await confession.save();

            const config = await Config.findOne({
                guildId: interaction.guild.id
            });

            // Log de modération : reste en embed classique (staff-facing)
            if (config && config.logChannel) {

                const logChannel = interaction.guild.channels.cache.get(
                    config.logChannel
                );

                if (logChannel) {

                    const reportEmbed = new EmbedBuilder()
                        .setColor("Red")
                        .setTitle("🚨 Confession signalée")
                        .addFields(
                            {
                                name: "Confession",
                                value: `#${confession.number}`
                            },
                            {
                                name: "Signalements",
                                value: confession.reports.length.toString(),
                                inline: true
                            },
                            {
                                name: "Message",
                                value: confession.content.slice(0, 1024)
                            }
                        )
                        .setTimestamp();

                    await logChannel.send({
                        embeds: [reportEmbed]
                    });

                }

            }

            return interaction.reply({
                content: "✅ La confession a été signalée à la modération.",
                ephemeral: true
            });

        }

    }

    /*
    ==========================================
                    MODALS
    ==========================================
    */

    if (!interaction.isModalSubmit()) return;

    /*
    =========================
    CRÉER UNE CONFESSION
    =========================
    */

    if (interaction.customId === "confession_modal") {

        const config = await Config.findOne({
            guildId: interaction.guild.id
        });

        if (!config) {
            return interaction.reply({
                content: "❌ Le système de confessions n'est pas configuré.",
                ephemeral: true
            });
        }

        if (config.blacklist.includes(interaction.user.id)) {
            return interaction.reply({
                content: "❌ Tu es blacklisté du système de confessions.",
                ephemeral: true
            });
        }

        const text = interaction.fields.getTextInputValue("confession_text");

        config.counter++;
        await config.save();

        const confession = await Confession.create({
            guildId: interaction.guild.id,
            channelId: config.confessionChannel,
            authorId: interaction.user.id,
            number: config.counter,
            content: text,
            status: "pending"
        });

        const logChannel = interaction.guild.channels.cache.get(
            config.logChannel
        );

        if (!logChannel) {
            return interaction.reply({
                content: "❌ Salon de modération introuvable.",
                ephemeral: true
            });
        }

        // Panel de modération : reste en embed classique (staff-facing)
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
            content: "✅ Ta confession a été envoyée aux modérateurs.",
            ephemeral: true
        });

    }

    /*
    =========================
    RÉPONDRE À UNE CONFESSION
    =========================
    */

    if (interaction.customId.startsWith("reply_modal_")) {

        const confessionId = interaction.customId.replace(
            "reply_modal_",
            ""
        );

        const confession = await Confession.findById(confessionId);

        if (!confession) {
            return interaction.reply({
                content: "❌ Confession introuvable.",
                ephemeral: true
            });
        }

        const reply = interaction.fields.getTextInputValue("reply_text");

        confession.replies.push({
            authorId: interaction.user.id,
            content: reply
        });

        await confession.save();

        const thread = interaction.guild.channels.cache.get(confession.threadId);

        if (thread) {

            const replyContainer = new ContainerBuilder()
                .setAccentColor(0x5865F2)
                .addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(reply)
                )
                .addTextDisplayComponents(
                    new TextDisplayBuilder().setContent("-# Réponse anonyme")
                );

            await thread.send({
                components: [replyContainer],
                flags: MessageFlags.IsComponentsV2
            });

        }

        return interaction.reply({
            content: "✅ Ta réponse a été publiée anonymement.",
            ephemeral: true
        });

    }

};

module.exports.buildConfessionContainer = buildConfessionContainer;
module.exports.buildStyle = buildStyle;
