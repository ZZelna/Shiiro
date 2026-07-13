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
    TextInputStyle,
    ContainerBuilder,
    TextDisplayBuilder,
    SeparatorBuilder,
    SeparatorSpacingSize,
    MessageFlags,
    AttachmentBuilder
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

// ─── Suivi du claim par salon (channelId -> userId) ──────────────────────────
// Remplace le champ d'embed "Pris en charge par" : en V2 il n'y a plus
// d'embed avec des fields, donc l'état est gardé ici plutôt que parsé
// depuis le contenu du message.
const ticketClaims = new Map();

/*
==========================================
    HELPERS V2
==========================================
*/

function getStaffMentionLine(category, creatorId) {
    const staffMentions = category.staffRoles.map(id => `<@&${id}>`).join(" ");
    return `<@${creatorId}> ${staffMentions}`;
}

function buildTicketButtonsRow(claimerId) {
    if (!claimerId) {
        return new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId("ticket_claim")
                .setLabel("Claim")
                .setEmoji("📌")
                .setStyle(ButtonStyle.Primary),

            new ButtonBuilder()
                .setCustomId("ticket_rename")
                .setLabel("Renommer")
                .setEmoji("✏️")
                .setStyle(ButtonStyle.Secondary),

            new ButtonBuilder()
                .setCustomId("ticket_close")
                .setLabel("Fermer")
                .setEmoji("🔒")
                .setStyle(ButtonStyle.Danger)
        );
    }

    return new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId("ticket_unclaim")
            .setLabel("Pris en charge")
            .setEmoji("📌")
            .setStyle(ButtonStyle.Success),

        new ButtonBuilder()
            .setCustomId("ticket_add")
            .setLabel("Ajouter")
            .setEmoji("➕")
            .setStyle(ButtonStyle.Primary),

        new ButtonBuilder()
            .setCustomId("ticket_remove")
            .setLabel("Retirer")
            .setEmoji("➖")
            .setStyle(ButtonStyle.Secondary),

        new ButtonBuilder()
            .setCustomId("ticket_rename")
            .setLabel("Renommer")
            .setEmoji("✏️")
            .setStyle(ButtonStyle.Secondary),

        new ButtonBuilder()
            .setCustomId("ticket_close")
            .setLabel("Fermer")
            .setEmoji("🔒")
            .setStyle(ButtonStyle.Danger)
    );
}

// ─── Export texte brut du ticket (remplace discord-html-transcripts) ────────
// La lib HTML plante sur certains messages (bug de rendu React connu sur les
// versions récentes). On récupère tout le contenu texte du salon nous-mêmes,
// simple et fiable.
async function buildTextTranscript(channel) {
    let allMessages = [];
    let lastId = null;

    // Pagination : Discord ne renvoie que 100 messages max par appel
    while (true) {
        const options = { limit: 100 };
        if (lastId) options.before = lastId;

        const batch = await channel.messages.fetch(options);
        if (batch.size === 0) break;

        allMessages.push(...batch.values());
        lastId = batch.last().id;

        if (batch.size < 100) break;
    }

    // Remet dans l'ordre chronologique (fetch renvoie du plus récent au plus vieux)
    allMessages.reverse();

    const lines = allMessages.map(msg => {
        const time = new Date(msg.createdTimestamp).toLocaleString("fr-FR");
        const author = msg.author?.tag || "Inconnu";
        let content = msg.content || "";

        if (!content && msg.components?.length) {
            content = "[Message avec composants/boutons — non affiché]";
        }
        if (msg.attachments?.size) {
            const files = [...msg.attachments.values()].map(a => a.url).join(", ");
            content += (content ? "\n" : "") + `[Pièce(s) jointe(s)] ${files}`;
        }

        return `[${time}] ${author} : ${content || "(message vide)"}`;
    });

    const text = lines.join("\n") || "Aucun message dans ce salon.";

    return new AttachmentBuilder(Buffer.from(text, "utf-8"), {
        name: `${channel.name}.txt`
    });
}

function buildTicketContainer(category, creatorId, claimerId) {
    let infoText = `**Catégorie :** ${category.name}\n**Créé par :** <@${creatorId}>`;

    if (claimerId) {
        infoText += `\n**Pris en charge par :** <@${claimerId}>`;
    }

    const container = new ContainerBuilder()
        .setAccentColor(0xFFD700)
        .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(`## 🎫 Ticket ${category.name}`)
        )
        .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
                `Un membre de la ${category.name.toLowerCase()} te répondra au plus vite.`
            )
        )
        .addSeparatorComponents(
            new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
        )
        .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(infoText)
        )
        .addSeparatorComponents(
            new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
        )
        .addActionRowComponents(
            buildTicketButtonsRow(claimerId)
        );

    return container;
}

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

        const mentionLine = new TextDisplayBuilder().setContent(
            getStaffMentionLine(category, interaction.user.id)
        );

        const container = buildTicketContainer(category, interaction.user.id, null);

        const panelMessage = await channel.send({
            components: [mentionLine, container],
            flags: MessageFlags.IsComponentsV2
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

        if (ticketClaims.get(interaction.channel.id)) {
            return interaction.reply({
                content: "❌ Ce ticket est déjà pris en charge.",
                ephemeral: true
            });
        }

        const category = Object.values(TICKET_CATEGORIES).find(
            c => c.categoryId === interaction.channel.parentId
        );

        if (!category) {
            return interaction.reply({
                content: "❌ Catégorie de ticket introuvable.",
                ephemeral: true
            });
        }

        ticketClaims.set(interaction.channel.id, interaction.user.id);

        const creatorId = interaction.channel.topic;
        const mentionLine = new TextDisplayBuilder().setContent(
            getStaffMentionLine(category, creatorId)
        );
        const container = buildTicketContainer(category, creatorId, interaction.user.id);

        await interaction.update({
            components: [mentionLine, container],
            flags: MessageFlags.IsComponentsV2
        });

        await interaction.channel.permissionOverwrites.edit(interaction.user.id, {
            ViewChannel: true,
            SendMessages: true
        });

        for (const roleId of category.staffRoles) {
            await interaction.channel.permissionOverwrites.edit(roleId, {
                ViewChannel: false
            });
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

        const claimerId = ticketClaims.get(interaction.channel.id);

        if (!claimerId) {
            return interaction.reply({
                content: "❌ Ce ticket n'est pas pris en charge.",
                ephemeral: true
            });
        }

        if (claimerId !== interaction.user.id) {
            return interaction.reply({
                content: "❌ Seule la personne ayant pris en charge ce ticket peut l'annuler.",
                ephemeral: true
            });
        }

        const category = Object.values(TICKET_CATEGORIES).find(
            c => c.categoryId === interaction.channel.parentId
        );

        ticketClaims.delete(interaction.channel.id);

        const creatorId = interaction.channel.topic;
        const mentionLine = new TextDisplayBuilder().setContent(
            getStaffMentionLine(category, creatorId)
        );
        const container = buildTicketContainer(category, creatorId, null);

        await interaction.update({
            components: [mentionLine, container],
            flags: MessageFlags.IsComponentsV2
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

        const confirmContainer = new ContainerBuilder()
            .setAccentColor(0xFFA500)
            .addTextDisplayComponents(
                new TextDisplayBuilder().setContent("## ⚠️ Confirmer la fermeture")
            )
            .addTextDisplayComponents(
                new TextDisplayBuilder().setContent(
                    "Es-tu sûr de vouloir fermer ce ticket ?\nCette action peut être annulée ci-dessous."
                )
            )
            .addActionRowComponents(
                new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId("ticket_close_confirm")
                        .setLabel("Confirmer")
                        .setEmoji("✅")
                        .setStyle(ButtonStyle.Danger),

                    new ButtonBuilder()
                        .setCustomId("ticket_close_cancel")
                        .setLabel("Annuler")
                        .setEmoji("❌")
                        .setStyle(ButtonStyle.Secondary)
                )
            );

        return interaction.reply({
            components: [confirmContainer],
            flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral
        });
    }

    // Étape 2a : annulation
    if (interaction.isButton() && interaction.customId === "ticket_close_cancel") {
        return interaction.update({
            components: [new TextDisplayBuilder().setContent("❌ Fermeture annulée.")],
            flags: MessageFlags.IsComponentsV2
        });
    }

    // Étape 2b : confirmation -> fermeture effective
    if (interaction.isButton() && interaction.customId === "ticket_close_confirm") {

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

        // Met à jour le message de confirmation éphémère
        await interaction.update({
            components: [new TextDisplayBuilder().setContent("🔒 Ticket fermé avec succès.")],
            flags: MessageFlags.IsComponentsV2
        });

        // Poste le panel de fermeture dans le salon
        await interaction.channel.send({
            components: [closeContainer],
            flags: MessageFlags.IsComponentsV2
        });

        // Coupe l'écriture pour l'auteur du ticket
        if (interaction.channel.topic) {
            await interaction.channel.permissionOverwrites.edit(
                interaction.channel.topic,
                { SendMessages: false }
            ).catch(() => {});
        }

        // Log (reste en embed classique, non user-facing)
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

        let attachment = null;
        try {
            attachment = await discordTranscripts.createTranscript(interaction.channel, {
                filename: `${interaction.channel.name}.html`,
                // ⚠️ Contournement : bug de rendu React dans discord-html-transcripts
                // sur certains messages avec composants (V2 ou classiques).
                // On exclut tout message avec des composants du transcript
                // pour éviter le crash, en gardant tout le texte de la conversation.
                filter: (message) => !message.components || message.components.length === 0
            });
        } catch (err) {
            console.error("❌ Erreur génération transcript (non bloquant) :", err);
        }

        const logChannel = interaction.guild.channels.cache.get(LOG_CHANNEL_ID);

        if (logChannel) {
            if (attachment) {
                await logChannel.send({
                    content: `📄 Transcript de ${interaction.channel.name}`,
                    files: [attachment]
                });
            } else {
                await logChannel.send({
                    content: `⚠️ Transcript de ${interaction.channel.name} indisponible (erreur de génération).`
                });
            }
        }

        await interaction.reply({
            content: "🗑️ Suppression du ticket dans 5 secondes...",
            ephemeral: true
        });

        ticketClaims.delete(interaction.channel.id);
        renameCooldowns.delete(interaction.channel.id);

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
module.exports.ticketClaims = ticketClaims;
module.exports.buildTicketContainer = buildTicketContainer;
module.exports.getStaffMentionLine = getStaffMentionLine;
