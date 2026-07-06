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

            const embed = new EmbedBuilder()
                .setColor("#F4B400")
                .setTitle("ℹ️ Informations")
                .setDescription(
`🔒 Les confessions sont totalement anonymes.

• Les modérateurs voient uniquement l'auteur pendant la validation.
• Les autres membres ne verront jamais ton identité.
• Tu peux liker, répondre ou signaler une confession.
• Les abus peuvent entraîner une sanction.`
                );

            return interaction.reply({
                embeds: [embed],
                ephemeral: true
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

    const likes = confession.likes.length;
    const dislikes = confession.dislikes.length;
    const replies = confession.replies.length;

    const total = likes + dislikes;
    const percent = total === 0 ? 0 : Math.round((likes / total) * 100);

    const bars = Math.round(percent / 10);

    const popularity =
        "🟩".repeat(bars) +
        "⬜".repeat(10 - bars);

    let color = "#5865F2";
    let badge = "🤫";

    if (likes >= 100) {
        color = "#9B59B6";
        badge = "👑";
    } else if (likes >= 50) {
        color = "#F1C40F";
        badge = "🔥";
    } else if (likes >= 25) {
        color = "#2ECC71";
        badge = "⭐";
    }

    const embed = new EmbedBuilder()
        .setColor(color)
        .setAuthor({
            name: `${badge} Confession Premium`,
            iconURL: interaction.guild.iconURL({ dynamic: true })
        })
        .setTitle(`Confession #${confession.number}`)
        .setDescription(
`> ${confession.content}

━━━━━━━━━━━━━━━━━━━━━━━━━━`
        )
        .addFields(
            {
                name: "❤️ Popularité",
                value: popularity
            },
            {
                name: "👍 Likes",
                value: `${likes}`,
                inline: true
            },
            {
                name: "👎 Dislikes",
                value: `${dislikes}`,
                inline: true
            },
            {
                name: "💬 Réponses",
                value: `${replies}`,
                inline: true
            }
        )
        .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
        .setFooter({
            text: `${interaction.guild.name} • Confession totalement anonyme`,
            iconURL: interaction.guild.iconURL({ dynamic: true })
        })
        .setTimestamp();

    const row = new ActionRowBuilder().addComponents(

        new ButtonBuilder()
            .setCustomId(`confession_like_${confession._id}`)
            .setEmoji("👍")
            .setLabel(`${likes}`)
            .setStyle(ButtonStyle.Success),

        new ButtonBuilder()
            .setCustomId(`confession_dislike_${confession._id}`)
            .setEmoji("👎")
            .setLabel(`${dislikes}`)
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
        embeds: [embed],
        components: [row]
    });

    // Création du thread
    const thread = await message.startThread({
        name: `💬 Discussions - Confession #${confession.number}`,
        autoArchiveDuration: 1440
    });

    await thread.send({
        embeds: [
            new EmbedBuilder()
                .setColor(color)
                .setTitle("💬 Bienvenue dans la discussion")
                .setDescription(
`Bienvenue dans le thread de cette confession.

📜 **Règles**

• Respectez tous les membres.
• Pas d'insultes.
• Pas de spam.
• Les réponses restent anonymes.
• Les modérateurs surveillent ce fil.

Bonne discussion ❤️`
                )
        ]
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
            await confession.save();

const likes = confession.likes.length;
const dislikes = confession.dislikes.length;
const replies = confession.replies.length;

const total = likes + dislikes;
const percent = total === 0 ? 0 : Math.round((likes / total) * 100);
const bars = Math.round(percent / 10);

const popularity =
    "🟩".repeat(bars) +
    "⬜".repeat(10 - bars);

let color = "#5865F2";
let badge = "🤫";

if (likes >= 100) {
    color = "#9B59B6";
    badge = "👑";
} else if (likes >= 50) {
    color = "#F1C40F";
    badge = "🔥";
} else if (likes >= 25) {
    color = "#2ECC71";
    badge = "⭐";
}

const row = new ActionRowBuilder().addComponents(

    new ButtonBuilder()
        .setCustomId(`confession_like_${confession._id}`)
        .setEmoji("👍")
        .setLabel(`${likes}`)
        .setStyle(ButtonStyle.Success),

    new ButtonBuilder()
        .setCustomId(`confession_dislike_${confession._id}`)
        .setEmoji("👎")
        .setLabel(`${dislikes}`)
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

const embed = new EmbedBuilder()
    .setColor(color)
    .setAuthor({
        name: `${badge} Confession Premium`,
        iconURL: interaction.guild.iconURL({ dynamic: true })
    })
    .setTitle(`Confession #${confession.number}`)
    .setDescription(
`> ${confession.content}

━━━━━━━━━━━━━━━━━━━━━━━━━━`
    )
    .addFields(
        {
            name: "❤️ Popularité",
            value: popularity
        },
        {
            name: "👍 Likes",
            value: `${likes}`,
            inline: true
        },
        {
            name: "👎 Dislikes",
            value: `${dislikes}`,
            inline: true
        },
        {
            name: "💬 Réponses",
            value: `${replies}`,
            inline: true
        }
    )
    .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
    .setFooter({
        text: `${interaction.guild.name} • Confession totalement anonyme`,
        iconURL: interaction.guild.iconURL({ dynamic: true })
    })
    .setTimestamp();

return interaction.update({
    embeds: [embed],
    components: [row]
});

return interaction.update({
    embeds: [embed],
    components: [row]
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

            const row = new ActionRowBuilder().addComponents(

                new ButtonBuilder()
                    .setCustomId(`confession_like_${confession._id}`)
                    .setEmoji("👍")
                    .setLabel(confession.likes.length.toString())
                    .setStyle(ButtonStyle.Success),

                new ButtonBuilder()
                    .setCustomId(`confession_dislike_${confession._id}`)
                    .setEmoji("👎")
                    .setLabel(confession.dislikes.length.toString())
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

          const embed = EmbedBuilder.from(interaction.message.embeds[0]);

embed.spliceFields(
    0,
    embed.data.fields?.length || 0,
    {
        name: "👍 Likes",
        value: confession.likes.length.toString(),
        inline: true
    },
    {
        name: "👎 Dislikes",
        value: confession.dislikes.length.toString(),
        inline: true
    }
);

return interaction.update({
    embeds: [embed],
    components: [row]
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

            if (config.logChannel) {

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

    await thread.send({
        embeds: [
            new EmbedBuilder()
                .setColor("#5865F2")
                .setDescription(reply)
                .setFooter({
                    text: "Réponse anonyme"
                })
                .setTimestamp()
        ]
    });

}

        return interaction.reply({
            content: "✅ Ta réponse a été publiée anonymement.",
            ephemeral: true
        });

    }

};
