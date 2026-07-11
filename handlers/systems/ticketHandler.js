const discordTranscripts = require("discord-html-transcripts");
const {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ChannelType,
    PermissionsBitField,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle
} = require("discord.js");

const TICKET_CATEGORIES = {
    abus: {
        name: "Gestion abus",
        categoryId: "1515681660866134046",
        staffRoles: ["1506696551706267688"]
    },
    staff: {
        name: "Gestion staff",
        categoryId: "1515681914923515954",
        staffRoles: ["1506696757642530982"]
    },
    partenariat: {
        name: "Équipe partenariats",
        categoryId: "1515682696871936152",
        staffRoles: ["1506702398029172796"]
    },
    casino: {
        name: "Gestion casino",
        categoryId: "1515682782557245450",
        staffRoles: ["1506709088451690708"]
    },
    admin: {
        name: "Support admin",
        categoryId: "1507090226114461879",
        staffRoles: ["1509601528242110525"]
    }
};

const LOG_CHANNEL_ID = "1517116985077665872";

// ─── Cooldown de renommage (5 min entre chaque renommage, par salon) ────────
const renameCooldowns = new Map();
const RENAME_COOLDOWN_MS = 5 * 60 * 1000;

module.exports = async function handleTicketInteraction(interaction) {

    // =========================
    // CRÉATION DES TICKETS
    // =========================
    if (
        interaction.isStringSelectMenu() &&
        interaction.customId === "ticket_category"
    ) {
        const type = interaction.values[0];
        const category = TICKET_CATEGORIES[type];

        if (!category) {
            return interaction.reply({
                content: "❌ Catégorie invalide.",
                ephemeral: true
            });
        }

        const already = interaction.guild.channels.cache.find(c =>
            c.topic === interaction.user.id &&
            c.parentId === category.categoryId
        );

        if (already) {
            return interaction.reply({
                content: `❌ Tu possèdes déjà un ticket : ${already}`,
                ephemeral: true
            });
        }

        const permissions = [
            {
                id: interaction.guild.id,
                deny: [PermissionsBitField.Flags.ViewChannel]
            },
            {
                id: interaction.user.id,
                allow: [
                    PermissionsBitField.Flags.ViewChannel,
                    PermissionsBitField.Flags.SendMessages,
                    PermissionsBitField.Flags.ReadMessageHistory
                ]
            }
        ];

        for (const role of category.staffRoles) {
            permissions.push({
                id: role,
                allow: [
                    PermissionsBitField.Flags.ViewChannel,
                    PermissionsBitField.Flags.SendMessages,
                    PermissionsBitField.Flags.ReadMessageHistory
                ]
            });
        }

        const channel = await interaction.guild.channels.create({
            name: `ticket-${interaction.user.username}`,
            type: ChannelType.GuildText,
            parent: category.categoryId,
            topic: interaction.user.id,
            permissionOverwrites: permissions
        });

        const embed = new EmbedBuilder()
            .setColor("#FFD700")
            .setTitle(`🎫 Ticket ${category.name}`)
            .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
            .setDescription(`Un membre de la ${category.name.toLowerCase()} te répondra au plus vite.`)
            .addFields(
                { name: "Catégorie", value: category.name, inline: true },
                { name: "Créé par", value: `${interaction.user}`, inline: true }
            )
            .setFooter({ text: `Ticket ouvert le ${new Date().toLocaleDateString("fr-FR")}` });

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

        const staffMentions = category.staffRoles.map(id => `<@&${id}>`).join(" ");

        const panelMessage = await channel.send({
            content: `${interaction.user} ${staffMentions}`,
            embeds: [embed],
            components: [row]
        });

        await panelMessage.pin().catch(() => {});

        return interaction.reply({
            content: `✅ Ton ticket a été créé : ${channel}`,
            ephemeral: true
        });
    }

    // =========================
    // REVENDIQUER LE TICKET
    // =========================
    if (interaction.isButton() && interaction.customId === "ticket_claim") {

        const claimButton = interaction.message.components[0].components.find(
            b => b.data.custom_id === "ticket_claim"
        );

        if (claimButton?.data?.disabled) {
            return interaction.reply({
                content: "❌ Ce ticket est déjà pris en charge.",
                ephemeral: true
            });
        }

        const category = Object.values(TICKET_CATEGORIES).find(
            c => c.categoryId === interaction.channel.parentId
        );

        const embed = EmbedBuilder.from(interaction.message.embeds[0]);

        embed.addFields({
            name: "📌 Pris en charge par",
            value: `${interaction.user}`,
            inline: false
        });

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId("ticket_unclaim")
                .setLabel(`📌 ${interaction.user.username}`)
                .setStyle(ButtonStyle.Success),

            new ButtonBuilder()
                .setCustomId("ticket_add")
                .setLabel("➕ Ajouter")
                .setStyle(ButtonStyle.Primary),

            new ButtonBuilder()
                .setCustomId("ticket_remove")
                .setLabel("➖ Retirer")
                .setStyle(ButtonStyle.Secondary),

            new ButtonBuilder()
                .setCustomId("ticket_rename")
                .setLabel("✏️ Renommer")
                .setStyle(ButtonStyle.Secondary),

            new ButtonBuilder()
                .setCustomId("ticket_close")
                .setLabel("🔒 Fermer")
                .setStyle(ButtonStyle.Danger)
        );

        await interaction.update({
            embeds: [embed],
            components: [row]
        });

        await interaction.channel.permissionOverwrites.edit(interaction.user.id, {
            ViewChannel: true,
            SendMessages: true
        });

        if (category) {
            for (const roleId of category.staffRoles) {
                await interaction.channel.permissionOverwrites.edit(roleId, {
                    ViewChannel: false
                });
            }
        }

        await interaction.channel.send({
            content: `📌 ${interaction.user} prend désormais ce ticket en charge.`
        });

        return;
    }

    // =========================
    // ANNULER LA PRISE EN CHARGE
    // =========================
    if (interaction.isButton() && interaction.customId === "ticket_unclaim") {

        const claimedField = interaction.message.embeds[0]?.fields?.find(
            f => f.name === "📌 Pris en charge par"
        );

        const claimerMatch = claimedField?.value.match(/<@!?(\d+)>/);
        const claimerId = claimerMatch ? claimerMatch[1] : null;

        if (claimerId && claimerId !== interaction.user.id) {
            return interaction.reply({
                content: "❌ Seule la personne ayant pris en charge ce ticket peut l'annuler.",
                ephemeral: true
            });
        }

        const category = Object.values(TICKET_CATEGORIES).find(
            c => c.categoryId === interaction.channel.parentId
        );

        const embed = EmbedBuilder.from(interaction.message.embeds[0]);
        embed.setFields(
            (interaction.message.embeds[0].fields || []).filter(
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

        await interaction.update({
            embeds: [embed],
            components: [row]
        });

        if (category) {
            for (const roleId of category.staffRoles) {
                await interaction.channel.permissionOverwrites.edit(roleId, {
                    ViewChannel: true,
                    SendMessages: true,
                    ReadMessageHistory: true
                });
            }
        }

        await interaction.channel.send({
            content: `📌 ${interaction.user} a annulé la prise en charge de ce ticket.`
        });

        return;
    }

    // =========================
    // RENOMMER LE TICKET (ouverture du modal)
    // =========================
    if (interaction.isButton() && interaction.customId === "ticket_rename") {

        const lastRename = renameCooldowns.get(interaction.channel.id);

        if (lastRename && Date.now() - lastRename < RENAME_COOLDOWN_MS) {
            const remaining = Math.ceil(
                (RENAME_COOLDOWN_MS - (Date.now() - lastRename)) / 1000 / 60
            );
            return interaction.reply({
                content: `❌ Ce ticket a déjà été renommé récemment. Réessaie dans ~${remaining} min.`,
                ephemeral: true
            });
        }

        const modal = new ModalBuilder()
            .setCustomId("ticket_rename_modal")
            .setTitle("✏️ Renommer le ticket");

        const input = new TextInputBuilder()
            .setCustomId("new_ticket_name")
            .setLabel("Nouveau nom du ticket")
            .setStyle(TextInputStyle.Short)
            .setPlaceholder("ex: ticket-urgence")
            .setMinLength(2)
            .setMaxLength(90)
            .setRequired(true);

        modal.addComponents(
            new ActionRowBuilder().addComponents(input)
        );

        return interaction.showModal(modal);
    }

    // =========================
    // RENOMMER LE TICKET (traitement du modal)
    // =========================
    if (interaction.isModalSubmit() && interaction.customId === "ticket_rename_modal") {

        const lastRename = renameCooldowns.get(interaction.channel.id);

        if (lastRename && Date.now() - lastRename < RENAME_COOLDOWN_MS) {
            const remaining = Math.ceil(
                (RENAME_COOLDOWN_MS - (Date.now() - lastRename)) / 1000 / 60
            );
            return interaction.reply({
                content: `❌ Ce ticket a déjà été renommé récemment. Réessaie dans ~${remaining} min.`,
                ephemeral: true
            });
        }

        const rawName = interaction.fields.getTextInputValue("new_ticket_name");

        const sanitized = rawName
            .toLowerCase()
            .replace(/\s+/g, "-")
            .replace(/[^a-z0-9-]/g, "")
            .slice(0, 90);

        if (!sanitized) {
            return interaction.reply({
                content: "❌ Nom invalide.",
                ephemeral: true
            });
        }

        try {
            await interaction.channel.setName(sanitized);

            renameCooldowns.set(interaction.channel.id, Date.now());

            await interaction.reply({
                content: `✅ Ticket renommé en \`${sanitized}\`.`,
                ephemeral: true
            });

            const logChannel = interaction.guild.channels.cache.get(LOG_CHANNEL_ID);
            if (logChannel) {
                await logChannel.send({
                    content: `✏️ Ticket renommé en **${sanitized}** par ${interaction.user}.`
                });
            }
        } catch (err) {
            console.error("❌ Erreur rename ticket :", err);
            return interaction.reply({
                content: "❌ Impossible de renommer ce salon (limite Discord atteinte : max 2 renommages toutes les 10 min).",
                ephemeral: true
            });
        }

        return;
    }

    // =========================
    // AJOUTER / RETIRER UN MEMBRE
    // =========================
    if (interaction.isButton() && interaction.customId === "ticket_add") {
        await interaction.reply({
            content: "Mentionne le membre à ajouter au ticket.",
            ephemeral: true
        });

        const filter = m => m.author.id === interaction.user.id;

        const collected = await interaction.channel.awaitMessages({
            filter,
            max: 1,
            time: 30000
        }).catch(() => null);

        if (!collected || !collected.first()) return;

        const member = collected.first().mentions.members.first();

        if (!member)
            return interaction.followUp({
                content: "❌ Aucun membre mentionné.",
                ephemeral: true
            });

        await interaction.channel.permissionOverwrites.edit(member.id, {
            ViewChannel: true,
            SendMessages: true,
            ReadMessageHistory: true
        });

        collected.first().delete().catch(() => {});

        interaction.followUp({
            content: `✅ ${member} a été ajouté au ticket.`,
            ephemeral: false
        });
        return;
    }

    if (interaction.isButton() && interaction.customId === "ticket_remove") {
        await interaction.reply({
            content: "Mentionne le membre à retirer du ticket.",
            ephemeral: true
        });

        const filter = m => m.author.id === interaction.user.id;

        const collected = await interaction.channel.awaitMessages({
            filter,
            max: 1,
            time: 30000
        }).catch(() => null);

        if (!collected || !collected.first()) return;

        const member = collected.first().mentions.members.first();

        if (!member)
            return interaction.followUp({
                content: "❌ Aucun membre mentionné.",
                ephemeral: true
            });

        await interaction.channel.permissionOverwrites.delete(member.id);

        collected.first().delete().catch(() => {});

        interaction.followUp({
            content: `✅ ${member} a été retiré du ticket.`,
            ephemeral: false
        });
        return;
    }

    // =========================
    // FERMETURE DU TICKET (AVEC CONFIRMATION)
    // =========================

    // Étape 1 : demande de confirmation
    if (interaction.isButton() && interaction.customId === "ticket_close") {

        const confirmEmbed = new EmbedBuilder()
            .setColor("Orange")
            .setTitle("⚠️ Confirmer la fermeture")
            .setDescription("Es-tu sûr de vouloir fermer ce ticket ?\nCette action peut être annulée ci-dessous.");

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId("ticket_close_confirm")
                .setLabel("✅ Confirmer")
                .setStyle(ButtonStyle.Danger),

            new ButtonBuilder()
                .setCustomId("ticket_close_cancel")
                .setLabel("❌ Annuler")
                .setStyle(ButtonStyle.Secondary)
        );

        return interaction.reply({
            embeds: [confirmEmbed],
            components: [row],
            ephemeral: true
        });
    }

    // Étape 2a : annulation
    if (interaction.isButton() && interaction.customId === "ticket_close_cancel") {
        return interaction.update({
            content: "❌ Fermeture annulée.",
            embeds: [],
            components: []
        });
    }

    // Étape 2b : confirmation -> fermeture effective
    if (interaction.isButton() && interaction.customId === "ticket_close_confirm") {

        const closeEmbed = new EmbedBuilder()
            .setColor("Orange")
            .setTitle("🔒 Ticket fermé")
            .setDescription("Ce ticket est fermé.\nSeul un modérateur peut désormais le supprimer.");

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId("ticket_delete")
                .setLabel("🗑️ Supprimer")
                .setStyle(ButtonStyle.Danger)
        );

        // Met à jour le message de confirmation éphémère
        await interaction.update({
            content: "🔒 Ticket fermé avec succès.",
            embeds: [],
            components: []
        });

        // Poste l'embed de fermeture dans le salon
        await interaction.channel.send({
            embeds: [closeEmbed],
            components: [row]
        });

        // Coupe l'écriture pour l'auteur du ticket
        if (interaction.channel.topic) {
            await interaction.channel.permissionOverwrites.edit(
                interaction.channel.topic,
                { SendMessages: false }
            ).catch(() => {});
        }

        const logChannel = interaction.guild.channels.cache.get(LOG_CHANNEL_ID);

        if (logChannel) {
            const logEmbed = new EmbedBuilder()
                .setColor("Red")
                .setTitle("📁 Ticket fermé")
                .addFields(
                    { name: "🎫 Ticket", value: interaction.channel.name, inline: true },
                    { name: "👤 Fermé par", value: `${interaction.user}`, inline: true }
                )
                .setTimestamp();

            await logChannel.send({ embeds: [logEmbed] });
        }

        return;
    }

    // =========================
    // SUPPRIMER LE TICKET
    // =========================
    if (interaction.isButton() && interaction.customId === "ticket_delete") {

        const staffRoles = [
            "1506696551706267688",
            "1506696757642530982",
            "1506702398029172796",
            "1506709088451690708",
            "1509601528242110525"
        ];

        const isStaff = interaction.member.roles.cache.some(role =>
            staffRoles.includes(role.id)
        );

        if (!isStaff) {
            return interaction.reply({
                content: "❌ Seul un membre du staff peut supprimer ce ticket.",
                ephemeral: true
            });
        }

        const attachment = await discordTranscripts.createTranscript(interaction.channel, {
            filename: `${interaction.channel.name}.html`
        });

        const logChannel = interaction.guild.channels.cache.get(LOG_CHANNEL_ID);

        if (logChannel) {
            await logChannel.send({
                content: `📄 Transcript de ${interaction.channel.name}`,
                files: [attachment]
            });
        }

        await interaction.reply({
            content: "🗑️ Suppression du ticket dans 5 secondes...",
            ephemeral: true
        });

        setTimeout(async () => {
            await interaction.channel.delete().catch(() => {});
        }, 5000);

        return;
    }
};

module.exports.TICKET_CATEGORIES = TICKET_CATEGORIES;
module.exports.renameCooldowns = renameCooldowns;
module.exports.RENAME_COOLDOWN_MS = RENAME_COOLDOWN_MS;
module.exports.LOG_CHANNEL_ID = LOG_CHANNEL_ID;
