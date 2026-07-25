const {
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require('discord.js');
const GuildConfig = require('../../models/GuildConfig');
const CustomRole = require('../../models/CustomRole');

const HEX_REGEX = /^#?[0-9A-Fa-f]{6}$/;

/**
 * Vérifie si le membre a le droit de créer un rôle perso :
 * booster du serveur OU possède le rôle "Rôle Perso" (donné par l'autre bot au niveau 70)
 */
async function isEligible(member, guildId) {
  if (member.premiumSince) return true; // booster natif Discord

  const config = await GuildConfig.findOne({ guildId });
  const unlockRoleId = config?.customRoleUnlockRoleId;
  if (unlockRoleId && member.roles.cache.has(unlockRoleId)) return true;

  return false;
}

/**
 * Repositionne le rôle perso pour qu'il reste toujours strictement entre le plafond et le plancher
 * configurés, tout en se calant sur le rôle le plus élevé que possède déjà le membre (dans cette fourchette).
 */
async function positionCustomRole(guild, member, role) {
  const config = await GuildConfig.findOne({ guildId: guild.id });
  const topId = config?.customRoleTopRoleId;
  const bottomId = config?.customRoleBottomRoleId;
  if (!topId || !bottomId) return; // pas configuré -> on laisse Discord placer par défaut

  const topRole = await guild.roles.fetch(topId).catch(() => null);
  const bottomRole = await guild.roles.fetch(bottomId).catch(() => null);
  if (!topRole || !bottomRole) return;

  const min = bottomRole.position + 1;
  const max = topRole.position - 1;
  if (max < min) return; // bornes mal configurées (trop proches), on ne touche à rien

  // Rôle le plus élevé du membre, en excluant son propre rôle perso et @everyone
  const memberHighest = member.roles.cache
    .filter(r => r.id !== role.id && r.id !== guild.id)
    .sort((a, b) => b.position - a.position)
    .first();

  const highestPosition = memberHighest ? memberHighest.position : min;
  const targetPosition = Math.min(Math.max(highestPosition, min), max);

  await role.setPosition(targetPosition).catch(() => {});
}

/**
 * Clic sur le bouton "Créer / modifier mon rôle" -> ouvre le modal (pré-rempli si un rôle existe déjà)
 */
async function handleCustomRoleButton(interaction) {
  const eligible = await isEligible(interaction.member, interaction.guild.id);
  if (!eligible) {
    return interaction.reply({
      content: "❌ Tu dois être **Booster** du serveur ou posséder le rôle **Rôle Perso** (niveau 70) pour créer un rôle personnalisé.",
      ephemeral: true,
    });
  }

  const existing = await CustomRole.findOne({ guildId: interaction.guild.id, userId: interaction.user.id });

  const modal = new ModalBuilder()
    .setCustomId('customrole_modal')
    .setTitle(existing ? 'Modifier ton rôle perso' : 'Créer ton rôle perso');

  const nameInput = new TextInputBuilder()
    .setCustomId('customrole_name')
    .setLabel('Nom du rôle')
    .setStyle(TextInputStyle.Short)
    .setMaxLength(100)
    .setRequired(true);
  if (existing) nameInput.setValue(existing.name);

  const colorInput = new TextInputBuilder()
    .setCustomId('customrole_color')
    .setLabel('Couleur (code hex, ex: #5865F2)')
    .setStyle(TextInputStyle.Short)
    .setMaxLength(7)
    .setRequired(true);
  if (existing) colorInput.setValue(existing.color);

  const iconInput = new TextInputBuilder()
    .setCustomId('customrole_icon')
    .setLabel('Icône (emoji ou URL image) — optionnel')
    .setStyle(TextInputStyle.Short)
    .setRequired(false);
  if (existing?.icon) iconInput.setValue(existing.icon);

  modal.addComponents(
    new ActionRowBuilder().addComponents(nameInput),
    new ActionRowBuilder().addComponents(colorInput),
    new ActionRowBuilder().addComponents(iconInput),
  );

  await interaction.showModal(modal);
}

/**
 * Soumission du modal -> crée ou modifie le rôle Discord + enregistre en base
 */
async function handleCustomRoleModal(interaction) {
  if (interaction.customId !== 'customrole_modal') return;

  await interaction.deferReply({ ephemeral: true });

  const eligible = await isEligible(interaction.member, interaction.guild.id);
  if (!eligible) {
    return interaction.editReply("❌ Tu n'as plus les conditions requises (Booster ou rôle Perso).");
  }

  const name = interaction.fields.getTextInputValue('customrole_name').trim();
  const rawColor = interaction.fields.getTextInputValue('customrole_color').trim();
  const rawIcon = interaction.fields.getTextInputValue('customrole_icon')?.trim() || null;

  if (!HEX_REGEX.test(rawColor)) {
    return interaction.editReply('❌ Couleur invalide. Utilise un code hex à 6 caractères, ex: `#5865F2`.');
  }
  const color = parseInt(rawColor.replace('#', ''), 16);

  const isImageUrl = rawIcon && /^https?:\/\//i.test(rawIcon);
  const isEmoji = rawIcon && !isImageUrl;

  const roleOptions = { name, color, reason: `Rôle perso de ${interaction.user.tag}` };
  if (isImageUrl) roleOptions.icon = rawIcon;
  if (isEmoji) roleOptions.unicodeEmoji = rawIcon;

  const existing = await CustomRole.findOne({ guildId: interaction.guild.id, userId: interaction.user.id });
  let role = null;

  if (existing) {
    role = await interaction.guild.roles.fetch(existing.roleId).catch(() => null);
  }

  try {
    if (role) {
      // Le rôle existe encore côté Discord -> on le modifie en place
      await role.edit(roleOptions);
    } else {
      // Pas de rôle existant (première création, ou rôle supprimé manuellement entre-temps)
      role = await interaction.guild.roles.create(roleOptions);
      await interaction.member.roles.add(role);
    }
  } catch (err) {
    // Cas fréquent : icône image refusée car le serveur n'a pas le niveau de boost requis
    if (rawIcon && isImageUrl) {
      try {
        delete roleOptions.icon;
        if (role) {
          await role.edit(roleOptions);
        } else {
          role = await interaction.guild.roles.create(roleOptions);
          await interaction.member.roles.add(role);
        }
        await CustomRole.findOneAndUpdate(
          { guildId: interaction.guild.id, userId: interaction.user.id },
          { guildId: interaction.guild.id, userId: interaction.user.id, roleId: role.id, name, color: rawColor, icon: null, updatedAt: new Date() },
          { upsert: true }
        );
        await positionCustomRole(interaction.guild, interaction.member, role);
        return interaction.editReply(
          `✅ Rôle **${name}** enregistré, mais l'icône image n'a pas pu être appliquée (le serveur n'a probablement pas le niveau de boost requis). Utilise un emoji à la place si tu veux une icône.`
        );
      } catch (err2) {
        return interaction.editReply(`❌ Erreur lors de la création du rôle : ${err2.message}`);
      }
    }
    return interaction.editReply(`❌ Erreur lors de la création du rôle : ${err.message}`);
  }

  await CustomRole.findOneAndUpdate(
    { guildId: interaction.guild.id, userId: interaction.user.id },
    { guildId: interaction.guild.id, userId: interaction.user.id, roleId: role.id, name, color: rawColor, icon: rawIcon, updatedAt: new Date() },
    { upsert: true }
  );
  await positionCustomRole(interaction.guild, interaction.member, role);

  await interaction.editReply(`✅ Ton rôle perso **${name}** a été ${existing ? 'mis à jour' : 'créé et attribué'} !`);
}

/**
 * Clic sur "Supprimer mon rôle perso" -> demande confirmation avant de supprimer
 */
async function handleCustomRoleDeleteButton(interaction) {
  const existing = await CustomRole.findOne({ guildId: interaction.guild.id, userId: interaction.user.id });
  if (!existing) {
    return interaction.reply({ content: "❌ Tu n'as pas de rôle perso à supprimer.", ephemeral: true });
  }

  const confirmRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('customrole_delete_confirm').setLabel('Confirmer la suppression').setStyle(ButtonStyle.Danger),
    new ButtonBuilder().setCustomId('customrole_delete_cancel').setLabel('Annuler').setStyle(ButtonStyle.Secondary),
  );

  await interaction.reply({
    content: `⚠️ Tu es sur le point de supprimer ton rôle perso **${existing.name}**. Cette action est irréversible.`,
    components: [confirmRow],
    ephemeral: true,
  });
}

/**
 * Confirmation ou annulation de la suppression
 */
async function handleCustomRoleDeleteConfirm(interaction) {
  if (interaction.customId === 'customrole_delete_cancel') {
    return interaction.update({ content: '❌ Suppression annulée.', components: [] });
  }

  const existing = await CustomRole.findOne({ guildId: interaction.guild.id, userId: interaction.user.id });
  if (!existing) {
    return interaction.update({ content: "❌ Tu n'as plus de rôle perso enregistré.", components: [] });
  }

  const role = await interaction.guild.roles.fetch(existing.roleId).catch(() => null);
  if (role) {
    await role.delete(`Suppression du rôle perso par ${interaction.user.tag}`).catch(() => {});
  }

  await CustomRole.deleteOne({ guildId: interaction.guild.id, userId: interaction.user.id });

  await interaction.update({
    content: `✅ Ton rôle perso **${existing.name}** a été supprimé.`,
    components: [],
  });
}

/**
 * Point d'entrée unique appelé pour CHAQUE interaction (comme les autres handlers de systems/).
 * Filtre en interne selon le type et le customId, ignore silencieusement tout le reste.
 */
module.exports = async function handleCustomRoleInteraction(interaction) {
  if (interaction.isButton()) {
    if (interaction.customId === 'customrole_create') return handleCustomRoleButton(interaction);
    if (interaction.customId === 'customrole_delete') return handleCustomRoleDeleteButton(interaction);
    if (interaction.customId === 'customrole_delete_confirm' || interaction.customId === 'customrole_delete_cancel') {
      return handleCustomRoleDeleteConfirm(interaction);
    }
    return; // pas pour nous
  }

  if (interaction.isModalSubmit()) {
    if (interaction.customId === 'customrole_modal') return handleCustomRoleModal(interaction);
    return; // pas pour nous
  }
};
