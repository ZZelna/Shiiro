const {
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  AttachmentBuilder,
  PermissionFlagsBits,
} = require('discord.js');
const GuildConfig = require('../../models/GuildConfig');
const CustomRole = require('../../models/CustomRole');

const HEX_REGEX = /^#?[0-9A-Fa-f]{6}$/;
const COMMAND_NAME_REGEX = /^[a-z0-9_-]{2,20}$/i;

function isAdmin(interaction) {
  return interaction.member.permissions.has(PermissionFlagsBits.ManageGuild);
}

/**
 * Retrouve un rôle perso soit par ID Discord de l'utilisateur, soit par nom de commande (avec ou sans +)
 */
async function resolveCustomRole(guildId, identifier) {
  const clean = identifier.trim();
  if (/^\d{15,25}$/.test(clean)) {
    return CustomRole.findOne({ guildId, userId: clean });
  }
  return CustomRole.findOne({ guildId, commandName: clean.replace(/^\+/, '').toLowerCase() });
}

async function positionCustomRole(guild, targetUserId, role) {
  const config = await GuildConfig.findOne({ guildId: guild.id });
  const topId = config?.customRoleTopRoleId;
  const bottomId = config?.customRoleBottomRoleId;
  if (!topId || !bottomId) return;

  const topRole = await guild.roles.fetch(topId).catch(() => null);
  const bottomRole = await guild.roles.fetch(bottomId).catch(() => null);
  if (!topRole || !bottomRole) return;

  const min = bottomRole.position + 1;
  const max = topRole.position - 1;
  if (max < min) return;

  const member = await guild.members.fetch(targetUserId).catch(() => null);
  const memberHighest = member
    ? member.roles.cache.filter(r => r.id !== role.id && r.id !== guild.id).sort((a, b) => b.position - a.position).first()
    : null;

  const targetPosition = Math.min(Math.max(memberHighest ? memberHighest.position : min, min), max);
  await role.setPosition(targetPosition).catch(() => {});
}

// =========================================================
// Actions immédiates (pas de modal)
// =========================================================

async function actionListe(interaction) {
  const roles = await CustomRole.find({ guildId: interaction.guild.id }).sort({ createdAt: 1 });
  if (!roles.length) {
    return interaction.reply({ content: 'Aucun rôle perso enregistré sur ce serveur.', ephemeral: true });
  }

  const lines = roles.map(r => `<@${r.userId}> — **${r.name}** (${r.color}) — \`+${r.commandName}\` — <@&${r.roleId}>`);
  let text = lines.join('\n');
  if (text.length > 3900) text = text.slice(0, 3900) + '\n… (liste tronquée, trop d\'entrées)';

  await interaction.reply({ content: `**📋 ${roles.length} rôle(s) perso**\n${text}`, ephemeral: true });
}

async function actionStatistiques(interaction) {
  const roles = await CustomRole.find({ guildId: interaction.guild.id });
  const owners = new Set(roles.map(r => r.userId));
  const activeShares = roles.reduce((sum, r) => sum + (r.sharedWith?.length || 0), 0);

  await interaction.reply({
    content:
      `**📊 Statistiques des rôles perso**\n` +
      `🎨 Rôles personnalisés : ${roles.length}\n` +
      `👑 Propriétaires : ${owners.size}\n` +
      `👥 Partages actifs : ${activeShares}\n` +
      `⚙️ Commandes créées : ${roles.length}`,
    ephemeral: true,
  });
}

async function actionSynchroniser(interaction) {
  await interaction.deferReply({ ephemeral: true });
  const roles = await CustomRole.find({ guildId: interaction.guild.id });

  let fixed = 0;
  let removed = 0;

  for (const entry of roles) {
    const role = await interaction.guild.roles.fetch(entry.roleId).catch(() => null);
    if (!role) {
      await CustomRole.deleteOne({ _id: entry._id });
      removed++;
      continue;
    }

    const member = await interaction.guild.members.fetch(entry.userId).catch(() => null);
    if (member && !member.roles.cache.has(role.id)) {
      await member.roles.add(role).catch(() => {});
      fixed++;
    }

    await positionCustomRole(interaction.guild, entry.userId, role);
  }

  await interaction.editReply(`✅ Synchronisation terminée : **${fixed}** rôle(s) réattribué(s), **${removed}** entrée(s) orpheline(s) supprimée(s).`);
}

async function actionReparer(interaction) {
  await interaction.deferReply({ ephemeral: true });
  const roles = await CustomRole.find({ guildId: interaction.guild.id });

  let repaired = 0;
  let removed = 0;
  const seenCommands = new Set();

  for (const entry of roles) {
    const role = await interaction.guild.roles.fetch(entry.roleId).catch(() => null);
    if (!role) {
      await CustomRole.deleteOne({ _id: entry._id });
      removed++;
      continue;
    }

    // Doublon de nom de commande (corruption de données) -> on renomme automatiquement
    if (seenCommands.has(entry.commandName)) {
      const newCommand = `${entry.commandName}${Math.floor(Math.random() * 1000)}`;
      entry.commandName = newCommand;
      await entry.save();
      repaired++;
    }
    seenCommands.add(entry.commandName);

    // Couleur mal formée -> on la resynchronise depuis le rôle Discord réel
    if (!HEX_REGEX.test(entry.color)) {
      entry.color = role.hexColor;
      await entry.save();
      repaired++;
    }
  }

  await interaction.editReply(`🔧 Réparation terminée : **${repaired}** entrée(s) corrigée(s), **${removed}** entrée(s) orpheline(s) supprimée(s).`);
}

async function actionExporter(interaction) {
  const roles = await CustomRole.find({ guildId: interaction.guild.id }).lean();
  const json = JSON.stringify(roles, null, 2);
  const attachment = new AttachmentBuilder(Buffer.from(json, 'utf8'), { name: `role-perso-export-${interaction.guild.id}.json` });

  await interaction.reply({ content: `📤 Export de **${roles.length}** rôle(s) perso.`, files: [attachment], ephemeral: true });
}

async function actionImporterInfo(interaction) {
  await interaction.reply({
    content: "📥 L'import se fait via une commande à part (les boutons ne peuvent pas recevoir de fichier) : `/role-perso-import fichier:<ton .json>`",
    ephemeral: true,
  });
}

// =========================================================
// Modals (ouverture)
// =========================================================

async function openRechercherModal(interaction) {
  const modal = new ModalBuilder().setCustomId('crAdminModal_rechercher').setTitle('Rechercher un rôle perso');
  const input = new TextInputBuilder()
    .setCustomId('cra_query').setLabel('ID utilisateur ou nom de commande')
    .setStyle(TextInputStyle.Short).setRequired(true);
  modal.addComponents(new ActionRowBuilder().addComponents(input));
  await interaction.showModal(modal);
}

async function openCreerModal(interaction) {
  const modal = new ModalBuilder().setCustomId('crAdminModal_creer').setTitle('Créer un rôle perso pour quelqu\'un');
  const fields = [
    ['cra_userid', 'ID Discord de la personne cible', true],
    ['cra_name', 'Nom du rôle', true],
    ['cra_color', 'Couleur (hex, ex: #5865F2)', true],
    ['cra_icon', 'Icône (emoji ou URL) — optionnel', false],
    ['cra_command', 'Nom de commande (ex: florine)', true],
  ];
  modal.addComponents(...fields.map(([id, label, required]) =>
    new ActionRowBuilder().addComponents(
      new TextInputBuilder().setCustomId(id).setLabel(label).setStyle(TextInputStyle.Short).setRequired(required)
    )
  ));
  await interaction.showModal(modal);
}

async function openSupprimerModal(interaction) {
  const modal = new ModalBuilder().setCustomId('crAdminModal_supprimer').setTitle('Supprimer un rôle perso');
  const input = new TextInputBuilder()
    .setCustomId('cra_identifier').setLabel('ID utilisateur ou nom de commande')
    .setStyle(TextInputStyle.Short).setRequired(true);
  modal.addComponents(new ActionRowBuilder().addComponents(input));
  await interaction.showModal(modal);
}

async function openRenommerModal(interaction) {
  const modal = new ModalBuilder().setCustomId('crAdminModal_renommer').setTitle('Renommer un rôle perso');
  modal.addComponents(
    new ActionRowBuilder().addComponents(
      new TextInputBuilder().setCustomId('cra_identifier').setLabel('ID utilisateur ou nom de commande').setStyle(TextInputStyle.Short).setRequired(true)
    ),
    new ActionRowBuilder().addComponents(
      new TextInputBuilder().setCustomId('cra_newname').setLabel('Nouveau nom').setStyle(TextInputStyle.Short).setRequired(true)
    ),
  );
  await interaction.showModal(modal);
}

async function openModifierModal(interaction) {
  const modal = new ModalBuilder().setCustomId('crAdminModal_modifier').setTitle('Modifier un rôle perso');
  const fields = [
    ['cra_identifier', 'ID utilisateur ou nom de commande', true],
    ['cra_name', 'Nouveau nom (vide = inchangé)', false],
    ['cra_color', 'Nouvelle couleur hex (vide = inchangé)', false],
    ['cra_icon', 'Nouvelle icône (vide = inchangé)', false],
    ['cra_command', 'Nouveau nom de commande (vide = inchangé)', false],
  ];
  modal.addComponents(...fields.map(([id, label, required]) =>
    new ActionRowBuilder().addComponents(
      new TextInputBuilder().setCustomId(id).setLabel(label).setStyle(TextInputStyle.Short).setRequired(required)
    )
  ));
  await interaction.showModal(modal);
}

async function openTransfererModal(interaction) {
  const modal = new ModalBuilder().setCustomId('crAdminModal_transferer').setTitle('Transférer un rôle perso');
  modal.addComponents(
    new ActionRowBuilder().addComponents(
      new TextInputBuilder().setCustomId('cra_identifier').setLabel('ID utilisateur ou nom de commande actuel').setStyle(TextInputStyle.Short).setRequired(true)
    ),
    new ActionRowBuilder().addComponents(
      new TextInputBuilder().setCustomId('cra_newowner').setLabel('ID Discord du nouveau propriétaire').setStyle(TextInputStyle.Short).setRequired(true)
    ),
  );
  await interaction.showModal(modal);
}

// =========================================================
// Modals (soumission)
// =========================================================

async function submitRechercher(interaction) {
  const query = interaction.fields.getTextInputValue('cra_query').trim();
  const entry = await resolveCustomRole(interaction.guild.id, query);
  if (!entry) {
    return interaction.reply({ content: `❌ Aucun rôle perso trouvé pour \`${query}\`.`, ephemeral: true });
  }
  await interaction.reply({
    content:
      `**Résultat**\n👤 Propriétaire : <@${entry.userId}>\n🎨 Nom : ${entry.name}\n🖌️ Couleur : ${entry.color}\n` +
      `⚙️ Commande : \`+${entry.commandName}\`\n👥 Partagé avec : ${entry.sharedWith?.length ? entry.sharedWith.map(id => `<@${id}>`).join(', ') : 'personne'}\n` +
      `🔗 Rôle : <@&${entry.roleId}>`,
    ephemeral: true,
  });
}

async function submitCreer(interaction) {
  await interaction.deferReply({ ephemeral: true });

  const userId = interaction.fields.getTextInputValue('cra_userid').trim();
  const name = interaction.fields.getTextInputValue('cra_name').trim();
  const rawColor = interaction.fields.getTextInputValue('cra_color').trim();
  const rawIcon = interaction.fields.getTextInputValue('cra_icon')?.trim() || null;
  const commandName = interaction.fields.getTextInputValue('cra_command').trim().toLowerCase();

  if (!/^\d{15,25}$/.test(userId)) return interaction.editReply('❌ ID utilisateur invalide.');
  if (!HEX_REGEX.test(rawColor)) return interaction.editReply('❌ Couleur invalide.');
  if (!COMMAND_NAME_REGEX.test(commandName)) return interaction.editReply('❌ Nom de commande invalide.');

  const alreadyOwner = await CustomRole.findOne({ guildId: interaction.guild.id, userId });
  if (alreadyOwner) return interaction.editReply('❌ Cette personne a déjà un rôle perso — utilise Modifier plutôt.');

  const commandTaken = await CustomRole.findOne({ guildId: interaction.guild.id, commandName });
  if (commandTaken) return interaction.editReply(`❌ La commande \`+${commandName}\` est déjà utilisée.`);

  const member = await interaction.guild.members.fetch(userId).catch(() => null);
  if (!member) return interaction.editReply("❌ Cette personne n'est pas sur le serveur.");

  const color = parseInt(rawColor.replace('#', ''), 16);
  const roleOptions = { name, color, reason: `Rôle perso créé par un admin pour ${member.user.tag}` };
  const isImageUrl = rawIcon && /^https?:\/\//i.test(rawIcon);
  if (rawIcon) roleOptions[isImageUrl ? 'icon' : 'unicodeEmoji'] = rawIcon;

  let role;
  try {
    role = await interaction.guild.roles.create(roleOptions);
  } catch {
    delete roleOptions.icon;
    role = await interaction.guild.roles.create(roleOptions);
  }
  await member.roles.add(role).catch(() => {});

  await CustomRole.create({ guildId: interaction.guild.id, userId, roleId: role.id, name, color: rawColor, icon: rawIcon, commandName });
  await positionCustomRole(interaction.guild, userId, role);

  await interaction.editReply(`✅ Rôle **${name}** créé et attribué à ${member}.`);
}

async function submitSupprimer(interaction) {
  await interaction.deferReply({ ephemeral: true });
  const identifier = interaction.fields.getTextInputValue('cra_identifier').trim();
  const entry = await resolveCustomRole(interaction.guild.id, identifier);
  if (!entry) return interaction.editReply(`❌ Aucun rôle perso trouvé pour \`${identifier}\`.`);

  const role = await interaction.guild.roles.fetch(entry.roleId).catch(() => null);
  if (role) await role.delete('Supprimé via le panneau admin').catch(() => {});
  await CustomRole.deleteOne({ _id: entry._id });

  await interaction.editReply(`✅ Rôle **${entry.name}** (<@${entry.userId}>) supprimé.`);
}

async function submitRenommer(interaction) {
  await interaction.deferReply({ ephemeral: true });
  const identifier = interaction.fields.getTextInputValue('cra_identifier').trim();
  const newName = interaction.fields.getTextInputValue('cra_newname').trim();

  const entry = await resolveCustomRole(interaction.guild.id, identifier);
  if (!entry) return interaction.editReply(`❌ Aucun rôle perso trouvé pour \`${identifier}\`.`);

  const role = await interaction.guild.roles.fetch(entry.roleId).catch(() => null);
  if (!role) return interaction.editReply("❌ Ce rôle n'existe plus côté Discord.");

  await role.setName(newName).catch(err => { throw err; });
  entry.name = newName;
  entry.updatedAt = new Date();
  await entry.save();

  await interaction.editReply(`✅ Rôle renommé en **${newName}**.`);
}

async function submitModifier(interaction) {
  await interaction.deferReply({ ephemeral: true });
  const identifier = interaction.fields.getTextInputValue('cra_identifier').trim();
  const newName = interaction.fields.getTextInputValue('cra_name')?.trim() || null;
  const newColorRaw = interaction.fields.getTextInputValue('cra_color')?.trim() || null;
  const newIcon = interaction.fields.getTextInputValue('cra_icon')?.trim() || null;
  const newCommand = interaction.fields.getTextInputValue('cra_command')?.trim().toLowerCase() || null;

  const entry = await resolveCustomRole(interaction.guild.id, identifier);
  if (!entry) return interaction.editReply(`❌ Aucun rôle perso trouvé pour \`${identifier}\`.`);

  const role = await interaction.guild.roles.fetch(entry.roleId).catch(() => null);
  if (!role) return interaction.editReply("❌ Ce rôle n'existe plus côté Discord.");

  if (newColorRaw && !HEX_REGEX.test(newColorRaw)) return interaction.editReply('❌ Couleur invalide.');
  if (newCommand) {
    if (!COMMAND_NAME_REGEX.test(newCommand)) return interaction.editReply('❌ Nom de commande invalide.');
    const taken = await CustomRole.findOne({ guildId: interaction.guild.id, commandName: newCommand, userId: { $ne: entry.userId } });
    if (taken) return interaction.editReply(`❌ La commande \`+${newCommand}\` est déjà prise.`);
  }

  const roleOptions = {};
  if (newName) roleOptions.name = newName;
  if (newColorRaw) roleOptions.color = parseInt(newColorRaw.replace('#', ''), 16);
  if (newIcon) roleOptions[/^https?:\/\//i.test(newIcon) ? 'icon' : 'unicodeEmoji'] = newIcon;

  if (Object.keys(roleOptions).length) {
    try {
      await role.edit(roleOptions);
    } catch {
      delete roleOptions.icon;
      if (Object.keys(roleOptions).length) await role.edit(roleOptions);
    }
  }

  if (newName) entry.name = newName;
  if (newColorRaw) entry.color = newColorRaw;
  if (newIcon) entry.icon = newIcon;
  if (newCommand) entry.commandName = newCommand;
  entry.updatedAt = new Date();
  await entry.save();

  await interaction.editReply(`✅ Rôle perso de <@${entry.userId}> mis à jour.`);
}

async function submitTransferer(interaction) {
  await interaction.deferReply({ ephemeral: true });
  const identifier = interaction.fields.getTextInputValue('cra_identifier').trim();
  const newOwnerId = interaction.fields.getTextInputValue('cra_newowner').trim();

  if (!/^\d{15,25}$/.test(newOwnerId)) return interaction.editReply('❌ ID du nouveau propriétaire invalide.');

  const entry = await resolveCustomRole(interaction.guild.id, identifier);
  if (!entry) return interaction.editReply(`❌ Aucun rôle perso trouvé pour \`${identifier}\`.`);

  const alreadyOwner = await CustomRole.findOne({ guildId: interaction.guild.id, userId: newOwnerId });
  if (alreadyOwner) return interaction.editReply('❌ Le nouveau propriétaire a déjà un rôle perso.');

  const newMember = await interaction.guild.members.fetch(newOwnerId).catch(() => null);
  if (!newMember) return interaction.editReply("❌ Cette personne n'est pas sur le serveur.");

  const role = await interaction.guild.roles.fetch(entry.roleId).catch(() => null);
  if (role) await newMember.roles.add(role).catch(() => {});

  const oldOwnerId = entry.userId;
  entry.userId = newOwnerId;
  entry.updatedAt = new Date();
  await entry.save();

  if (role) await positionCustomRole(interaction.guild, newOwnerId, role);

  await interaction.editReply(`✅ Rôle **${entry.name}** transféré de <@${oldOwnerId}> à ${newMember}.`);
}

// =========================================================
// Point d'entrée unique
// =========================================================
module.exports = async function handleCustomRoleAdminInteraction(interaction) {
  const isButton = interaction.isButton?.() && interaction.customId?.startsWith('crAdmin_');
  const isModal = interaction.isModalSubmit?.() && interaction.customId?.startsWith('crAdminModal_');
  if (!isButton && !isModal) return;

  if (!isAdmin(interaction)) {
    return interaction.reply({ content: '❌ Réservé aux admins.', ephemeral: true });
  }

  if (isButton) {
    switch (interaction.customId) {
      case 'crAdmin_liste': return actionListe(interaction);
      case 'crAdmin_rechercher': return openRechercherModal(interaction);
      case 'crAdmin_creer': return openCreerModal(interaction);
      case 'crAdmin_supprimer': return openSupprimerModal(interaction);
      case 'crAdmin_renommer': return openRenommerModal(interaction);
      case 'crAdmin_modifier': return openModifierModal(interaction);
      case 'crAdmin_transferer': return openTransfererModal(interaction);
      case 'crAdmin_synchroniser': return actionSynchroniser(interaction);
      case 'crAdmin_statistiques': return actionStatistiques(interaction);
      case 'crAdmin_reparer': return actionReparer(interaction);
      case 'crAdmin_exporter': return actionExporter(interaction);
      case 'crAdmin_importer': return actionImporterInfo(interaction);
    }
    return;
  }

  switch (interaction.customId) {
    case 'crAdminModal_rechercher': return submitRechercher(interaction);
    case 'crAdminModal_creer': return submitCreer(interaction);
    case 'crAdminModal_supprimer': return submitSupprimer(interaction);
    case 'crAdminModal_renommer': return submitRenommer(interaction);
    case 'crAdminModal_modifier': return submitModifier(interaction);
    case 'crAdminModal_transferer': return submitTransferer(interaction);
  }
};
