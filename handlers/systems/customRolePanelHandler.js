const {
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    ActionRowBuilder,
    EmbedBuilder,
    AttachmentBuilder,
    PermissionFlagsBits
} = require("discord.js");

const CustomRole = require("../models/CustomRole");

const ALLOWED_ROLE = "1506674274826584284";

/**
 * À brancher dans ton event interactionCreate existant, par exemple :
 *
 * const handleCustomRoles = require("../handlers/customRolesHandler");
 *
 * client.on("interactionCreate", async (interaction) => {
 *     if (interaction.isButton() && interaction.customId.startsWith("customroles:")) {
 *         return handleCustomRoles(interaction);
 *     }
 *     if (interaction.isModalSubmit() && interaction.customId.startsWith("customroles:")) {
 *         return handleCustomRoles(interaction);
 *     }
 * });
 */

function isAllowed(interaction) {
    return interaction.member.roles.cache.has(ALLOWED_ROLE);
}

function hexToInt(hex) {
    return parseInt(hex.replace("#", ""), 16);
}

function isValidHex(hex) {
    return /^#?[0-9A-Fa-f]{6}$/.test(hex);
}

function normalizeHex(hex) {
    return hex.startsWith("#") ? hex : `#${hex}`;
}

module.exports = async function handleCustomRoles(interaction) {
    if (!isAllowed(interaction)) {
        return interaction.reply({
            content: "❌ Vous n'avez pas la permission.",
            ephemeral: true
        });
    }

    if (interaction.isButton()) {
        const action = interaction.customId.split(":")[1];

        switch (action) {
            case "list": return handleList(interaction);
            case "search": return openSearchModal(interaction);
            case "create": return openCreateModal(interaction);
            case "delete": return openTargetModal(interaction, "delete", "Supprimer un rôle", "Nom de commande du rôle à supprimer");
            case "rename": return openRenameModal(interaction);
            case "edit": return openEditModal(interaction);
            case "transfer": return openTransferModal(interaction);
            case "sync": return openTargetModal(interaction, "sync", "Synchroniser un rôle", "Nom de commande du rôle à synchroniser (vide = tous)", false);
            case "stats": return handleStats(interaction);
            case "repair": return handleRepair(interaction);
            case "export": return handleExport(interaction);
            case "import": return openImportModal(interaction);
            default:
                return interaction.reply({ content: "❌ Action inconnue.", ephemeral: true });
        }
    }

    if (interaction.isModalSubmit()) {
        const action = interaction.customId.split(":")[1];

        switch (action) {
            case "search": return submitSearch(interaction);
            case "create": return submitCreate(interaction);
            case "delete": return submitDelete(interaction);
            case "rename": return submitRename(interaction);
            case "edit": return submitEdit(interaction);
            case "transfer": return submitTransfer(interaction);
            case "sync": return submitSync(interaction);
            case "import": return submitImport(interaction);
            default:
                return interaction.reply({ content: "❌ Action inconnue.", ephemeral: true });
        }
    }
};

// ---------- LISTE ----------

async function handleList(interaction) {
    const roles = await CustomRole.find({ guildId: interaction.guild.id }).sort({ createdAt: -1 }).limit(25);

    if (!roles.length) {
        return interaction.reply({ content: "Aucun rôle personnalisé trouvé.", ephemeral: true });
    }

    const lines = roles.map(r =>
        `**${r.name}** — \`+${r.commandName}\` — <@${r.userId}> — ${r.color}${r.sharedWith.length ? ` — 🤝 ${r.sharedWith.length} partage(s)` : ""}`
    );

    const embed = new EmbedBuilder()
        .setTitle(`📋 Rôles personnalisés (${roles.length}/${await CustomRole.countDocuments({ guildId: interaction.guild.id })})`)
        .setDescription(lines.join("\n"))
        .setColor(0x5865F2);

    return interaction.reply({ embeds: [embed], ephemeral: true });
}

// ---------- RECHERCHE ----------

function openSearchModal(interaction) {
    const modal = new ModalBuilder()
        .setCustomId("customroles:search")
        .setTitle("Rechercher un rôle")
        .addComponents(
            new ActionRowBuilder().addComponents(
                new TextInputBuilder()
                    .setCustomId("query")
                    .setLabel("Nom, commande ou ID d'utilisateur")
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true)
            )
        );

    return interaction.showModal(modal);
}

async function submitSearch(interaction) {
    const query = interaction.fields.getTextInputValue("query").trim();
    const mentionMatch = query.match(/^<@!?(\d+)>$/);
    const userId = mentionMatch ? mentionMatch[1] : (/^\d{15,20}$/.test(query) ? query : null);

    const filter = { guildId: interaction.guild.id };

    if (userId) {
        filter.$or = [{ userId }, { sharedWith: userId }];
    } else {
        const regex = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
        filter.$or = [{ name: regex }, { commandName: regex }];
    }

    const roles = await CustomRole.find(filter).limit(15);

    if (!roles.length) {
        return interaction.reply({ content: `Aucun résultat pour \`${query}\`.`, ephemeral: true });
    }

    const lines = roles.map(r => `**${r.name}** — \`+${r.commandName}\` — <@${r.userId}> — ${r.color}`);

    const embed = new EmbedBuilder()
        .setTitle(`🔍 Résultats pour "${query}"`)
        .setDescription(lines.join("\n"))
        .setColor(0x57F287);

    return interaction.reply({ embeds: [embed], ephemeral: true });
}

// ---------- CRÉATION ----------

function openCreateModal(interaction) {
    const modal = new ModalBuilder()
        .setCustomId("customroles:create")
        .setTitle("Créer un rôle personnalisé")
        .addComponents(
            new ActionRowBuilder().addComponents(
                new TextInputBuilder().setCustomId("target").setLabel("ID de l'utilisateur propriétaire").setStyle(TextInputStyle.Short).setRequired(true)
            ),
            new ActionRowBuilder().addComponents(
                new TextInputBuilder().setCustomId("name").setLabel("Nom du rôle").setStyle(TextInputStyle.Short).setRequired(true)
            ),
            new ActionRowBuilder().addComponents(
                new TextInputBuilder().setCustomId("color").setLabel("Couleur (hex, ex: #5865F2)").setStyle(TextInputStyle.Short).setRequired(false)
            ),
            new ActionRowBuilder().addComponents(
                new TextInputBuilder().setCustomId("commandName").setLabel("Nom de commande (ex: gold)").setStyle(TextInputStyle.Short).setRequired(true)
            )
        );

    return interaction.showModal(modal);
}

async function submitCreate(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const targetId = interaction.fields.getTextInputValue("target").trim().replace(/[<@!>]/g, "");
    const name = interaction.fields.getTextInputValue("name").trim();
    const rawColor = interaction.fields.getTextInputValue("color").trim();
    const commandName = interaction.fields.getTextInputValue("commandName").trim().toLowerCase();

    if (rawColor && !isValidHex(rawColor)) {
        return interaction.editReply("❌ Couleur hex invalide.");
    }
    const color = rawColor ? normalizeHex(rawColor) : "#5865F2";

    const existingUser = await CustomRole.findOne({ guildId: interaction.guild.id, userId: targetId });
    if (existingUser) {
        return interaction.editReply(`❌ <@${targetId}> possède déjà un rôle personnalisé (\`+${existingUser.commandName}\`).`);
    }

    const existingCommand = await CustomRole.findOne({ guildId: interaction.guild.id, commandName });
    if (existingCommand) {
        return interaction.editReply(`❌ La commande \`+${commandName}\` est déjà utilisée.`);
    }

    let discordRole;
    try {
        discordRole = await interaction.guild.roles.create({
            name,
            color: hexToInt(color),
            reason: `Rôle personnalisé créé par ${interaction.user.tag}`
        });

        const member = await interaction.guild.members.fetch(targetId);
        await member.roles.add(discordRole);
    } catch (err) {
        if (discordRole) await discordRole.delete().catch(() => {});
        return interaction.editReply(`❌ Erreur lors de la création du rôle Discord : ${err.message}`);
    }

    try {
        await CustomRole.create({
            guildId: interaction.guild.id,
            userId: targetId,
            roleId: discordRole.id,
            name,
            color,
            commandName
        });
    } catch (err) {
        // Filet de sécurité si une double soumission (ou une collision avec le système
        // self-service, qui utilise la même collection) crée un conflit d'index unique.
        await discordRole.delete().catch(() => {});
        if (err.code === 11000) {
            return interaction.editReply("❌ Ce nom de commande ou cet utilisateur a déjà un rôle enregistré entre-temps.");
        }
        return interaction.editReply(`❌ Erreur lors de l'enregistrement en base : ${err.message}`);
    }

    return interaction.editReply(`✅ Rôle **${name}** (\`+${commandName}\`) créé pour <@${targetId}>.`);
}

// ---------- SUPPRESSION / SYNC — modal générique à un champ ----------

function openTargetModal(interaction, action, title, label, required = true) {
    const modal = new ModalBuilder()
        .setCustomId(`customroles:${action}`)
        .setTitle(title)
        .addComponents(
            new ActionRowBuilder().addComponents(
                new TextInputBuilder()
                    .setCustomId("commandName")
                    .setLabel(label)
                    .setStyle(TextInputStyle.Short)
                    .setRequired(required)
            )
        );

    return interaction.showModal(modal);
}

async function submitDelete(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const commandName = interaction.fields.getTextInputValue("commandName").trim().toLowerCase();
    const role = await CustomRole.findOne({ guildId: interaction.guild.id, commandName });

    if (!role) {
        return interaction.editReply(`❌ Aucun rôle trouvé pour \`+${commandName}\`.`);
    }

    const discordRole = interaction.guild.roles.cache.get(role.roleId);
    if (discordRole) {
        await discordRole.delete(`Rôle personnalisé supprimé par ${interaction.user.tag}`).catch(() => {});
    }

    await CustomRole.deleteOne({ _id: role._id });

    return interaction.editReply(`✅ Rôle **${role.name}** (\`+${commandName}\`) supprimé, ainsi que tous les partages associés.`);
}

// ---------- RENOMMER ----------

function openRenameModal(interaction) {
    const modal = new ModalBuilder()
        .setCustomId("customroles:rename")
        .setTitle("Renommer un rôle")
        .addComponents(
            new ActionRowBuilder().addComponents(
                new TextInputBuilder().setCustomId("commandName").setLabel("Nom de commande actuel").setStyle(TextInputStyle.Short).setRequired(true)
            ),
            new ActionRowBuilder().addComponents(
                new TextInputBuilder().setCustomId("newName").setLabel("Nouveau nom du rôle").setStyle(TextInputStyle.Short).setRequired(true)
            )
        );

    return interaction.showModal(modal);
}

async function submitRename(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const commandName = interaction.fields.getTextInputValue("commandName").trim().toLowerCase();
    const newName = interaction.fields.getTextInputValue("newName").trim();

    const role = await CustomRole.findOne({ guildId: interaction.guild.id, commandName });
    if (!role) {
        return interaction.editReply(`❌ Aucun rôle trouvé pour \`+${commandName}\`.`);
    }

    const discordRole = interaction.guild.roles.cache.get(role.roleId);
    if (discordRole) {
        await discordRole.setName(newName, `Renommé par ${interaction.user.tag}`).catch(() => {});
    }

    role.name = newName;
    await role.save();

    return interaction.editReply(`✅ Rôle \`+${commandName}\` renommé en **${newName}**.`);
}

// ---------- MODIFIER (couleur / icône) ----------

function openEditModal(interaction) {
    const modal = new ModalBuilder()
        .setCustomId("customroles:edit")
        .setTitle("Modifier un rôle")
        .addComponents(
            new ActionRowBuilder().addComponents(
                new TextInputBuilder().setCustomId("commandName").setLabel("Nom de commande").setStyle(TextInputStyle.Short).setRequired(true)
            ),
            new ActionRowBuilder().addComponents(
                new TextInputBuilder().setCustomId("color").setLabel("Nouvelle couleur (hex)").setStyle(TextInputStyle.Short).setRequired(false)
            ),
            new ActionRowBuilder().addComponents(
                new TextInputBuilder().setCustomId("icon").setLabel("URL de l'icône (laisser vide pour retirer)").setStyle(TextInputStyle.Short).setRequired(false)
            )
        );

    return interaction.showModal(modal);
}

async function submitEdit(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const commandName = interaction.fields.getTextInputValue("commandName").trim().toLowerCase();
    const rawColor = interaction.fields.getTextInputValue("color").trim();
    const icon = interaction.fields.getTextInputValue("icon").trim();

    const role = await CustomRole.findOne({ guildId: interaction.guild.id, commandName });
    if (!role) {
        return interaction.editReply(`❌ Aucun rôle trouvé pour \`+${commandName}\`.`);
    }

    if (rawColor && !isValidHex(rawColor)) {
        return interaction.editReply("❌ Couleur hex invalide.");
    }

    const discordRole = interaction.guild.roles.cache.get(role.roleId);

    if (rawColor) {
        const color = normalizeHex(rawColor);
        if (discordRole) await discordRole.setColor(hexToInt(color)).catch(() => {});
        role.color = color;
    }

    if (interaction.fields.fields.has("icon")) {
        role.icon = icon || null;
        if (discordRole && discordRole.guild.features.includes("ROLE_ICONS")) {
            await discordRole.setIcon(icon || null).catch(() => {});
        }
    }

    await role.save();

    return interaction.editReply(`✅ Rôle \`+${commandName}\` mis à jour.`);
}

// ---------- TRANSFÉRER ----------

function openTransferModal(interaction) {
    const modal = new ModalBuilder()
        .setCustomId("customroles:transfer")
        .setTitle("Transférer un rôle")
        .addComponents(
            new ActionRowBuilder().addComponents(
                new TextInputBuilder().setCustomId("commandName").setLabel("Nom de commande").setStyle(TextInputStyle.Short).setRequired(true)
            ),
            new ActionRowBuilder().addComponents(
                new TextInputBuilder().setCustomId("newOwner").setLabel("ID du nouveau propriétaire").setStyle(TextInputStyle.Short).setRequired(true)
            )
        );

    return interaction.showModal(modal);
}

async function submitTransfer(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const commandName = interaction.fields.getTextInputValue("commandName").trim().toLowerCase();
    const newOwnerId = interaction.fields.getTextInputValue("newOwner").trim().replace(/[<@!>]/g, "");

    const role = await CustomRole.findOne({ guildId: interaction.guild.id, commandName });
    if (!role) {
        return interaction.editReply(`❌ Aucun rôle trouvé pour \`+${commandName}\`.`);
    }

    const alreadyOwns = await CustomRole.findOne({ guildId: interaction.guild.id, userId: newOwnerId });
    if (alreadyOwns) {
        return interaction.editReply(`❌ <@${newOwnerId}> possède déjà un rôle personnalisé (\`+${alreadyOwns.commandName}\`).`);
    }

    const oldOwnerId = role.userId;
    role.userId = newOwnerId;
    role.sharedWith = role.sharedWith.filter(id => id !== newOwnerId);
    await role.save();

    const discordRole = interaction.guild.roles.cache.get(role.roleId);
    if (discordRole) {
        try {
            const newMember = await interaction.guild.members.fetch(newOwnerId);
            await newMember.roles.add(discordRole);
        } catch {}
    }

    return interaction.editReply(`✅ Rôle \`+${commandName}\` transféré de <@${oldOwnerId}> à <@${newOwnerId}>.`);
}

// ---------- SYNCHRONISER ----------
// Aligne la base de données sur l'état réel du rôle Discord (nom, couleur).

async function submitSync(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const commandName = interaction.fields.getTextInputValue("commandName")?.trim().toLowerCase();
    const filter = { guildId: interaction.guild.id };
    if (commandName) filter.commandName = commandName;

    const roles = await CustomRole.find(filter);
    if (!roles.length) {
        return interaction.editReply(commandName ? `❌ Aucun rôle trouvé pour \`+${commandName}\`.` : "❌ Aucun rôle à synchroniser.");
    }

    let updated = 0;
    for (const role of roles) {
        const discordRole = interaction.guild.roles.cache.get(role.roleId);
        if (!discordRole) continue;

        const discordHex = `#${discordRole.color.toString(16).padStart(6, "0")}`;
        let changed = false;

        if (discordRole.name !== role.name) {
            role.name = discordRole.name;
            changed = true;
        }
        if (discordHex.toLowerCase() !== role.color.toLowerCase()) {
            role.color = discordHex;
            changed = true;
        }

        if (changed) {
            await role.save();
            updated++;
        }
    }

    return interaction.editReply(`🔄 Synchronisation terminée. ${updated}/${roles.length} rôle(s) mis à jour depuis Discord.`);
}

// ---------- STATISTIQUES ----------

async function handleStats(interaction) {
    const roles = await CustomRole.find({ guildId: interaction.guild.id });

    const totalRoles = roles.length;
    const totalShares = roles.reduce((t, r) => t + r.sharedWith.length, 0);
    const mostShared = [...roles].sort((a, b) => b.sharedWith.length - a.sharedWith.length)[0];
    const newest = [...roles].sort((a, b) => b.createdAt - a.createdAt)[0];

    const embed = new EmbedBuilder()
        .setTitle("📊 Statistiques des rôles personnalisés")
        .setColor(0x5865F2)
        .addFields(
            { name: "Total de rôles", value: `${totalRoles}`, inline: true },
            { name: "Partages actifs", value: `${totalShares}`, inline: true },
            { name: "Rôle le plus partagé", value: mostShared ? `**${mostShared.name}** (${mostShared.sharedWith.length} partage(s))` : "—", inline: false },
            { name: "Dernier créé", value: newest ? `**${newest.name}** — \`+${newest.commandName}\`` : "—", inline: false }
        );

    return interaction.reply({ embeds: [embed], ephemeral: true });
}

// ---------- RÉPARER ----------
// Supprime les entrées orphelines (rôle Discord supprimé) et retire les membres
// qui n'ont plus le rôle en base des partages/propriété.

async function handleRepair(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const roles = await CustomRole.find({ guildId: interaction.guild.id });
    let orphansRemoved = 0;
    let sharesFixed = 0;

    for (const role of roles) {
        const discordRole = interaction.guild.roles.cache.get(role.roleId);

        if (!discordRole) {
            await CustomRole.deleteOne({ _id: role._id });
            orphansRemoved++;
            continue;
        }

        const validShares = [];
        for (const memberId of role.sharedWith) {
            const member = await interaction.guild.members.fetch(memberId).catch(() => null);
            if (member && member.roles.cache.has(role.roleId)) {
                validShares.push(memberId);
            } else {
                sharesFixed++;
            }
        }

        if (validShares.length !== role.sharedWith.length) {
            role.sharedWith = validShares;
            await role.save();
        }
    }

    return interaction.editReply(`🛠️ Réparation terminée : ${orphansRemoved} rôle(s) orphelin(s) supprimé(s), ${sharesFixed} partage(s) invalide(s) nettoyé(s).`);
}

// ---------- EXPORTER ----------

async function handleExport(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const roles = await CustomRole.find({ guildId: interaction.guild.id }).lean();

    const data = roles.map(r => ({
        userId: r.userId,
        roleId: r.roleId,
        name: r.name,
        color: r.color,
        icon: r.icon,
        commandName: r.commandName,
        sharedWith: r.sharedWith,
        createdAt: r.createdAt
    }));

    const buffer = Buffer.from(JSON.stringify(data, null, 2), "utf-8");
    const attachment = new AttachmentBuilder(buffer, { name: `customroles-${interaction.guild.id}.json` });

    return interaction.editReply({ content: `📤 Export de ${data.length} rôle(s).`, files: [attachment] });
}

// ---------- IMPORTER ----------

function openImportModal(interaction) {
    const modal = new ModalBuilder()
        .setCustomId("customroles:import")
        .setTitle("Importer des rôles (JSON)")
        .addComponents(
            new ActionRowBuilder().addComponents(
                new TextInputBuilder()
                    .setCustomId("json")
                    .setLabel("Contenu JSON exporté")
                    .setStyle(TextInputStyle.Paragraph)
                    .setRequired(true)
            )
        );

    return interaction.showModal(modal);
}

async function submitImport(interaction) {
    await interaction.deferReply({ ephemeral: true });

    let data;
    try {
        data = JSON.parse(interaction.fields.getTextInputValue("json"));
        if (!Array.isArray(data)) throw new Error("Le JSON doit être un tableau.");
    } catch (err) {
        return interaction.editReply(`❌ JSON invalide : ${err.message}`);
    }

    let imported = 0;
    let skipped = 0;

    for (const entry of data) {
        if (!entry.userId || !entry.roleId || !entry.name || !entry.commandName) {
            skipped++;
            continue;
        }

        const discordRole = interaction.guild.roles.cache.get(entry.roleId);
        if (!discordRole) {
            skipped++;
            continue;
        }

        const exists = await CustomRole.findOne({
            guildId: interaction.guild.id,
            $or: [{ userId: entry.userId }, { commandName: entry.commandName }, { roleId: entry.roleId }]
        });
        if (exists) {
            skipped++;
            continue;
        }

        await CustomRole.create({
            guildId: interaction.guild.id,
            userId: entry.userId,
            roleId: entry.roleId,
            name: entry.name,
            color: entry.color || "#5865F2",
            icon: entry.icon || null,
            commandName: entry.commandName,
            sharedWith: Array.isArray(entry.sharedWith) ? entry.sharedWith : []
        });
        imported++;
    }

    return interaction.editReply(`📥 Import terminé : ${imported} rôle(s) importé(s), ${skipped} ignoré(s) (doublon ou rôle Discord introuvable).`);
}
