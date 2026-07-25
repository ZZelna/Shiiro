const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const GuildConfig = require('../models/GuildConfig');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setup-role-perso')
    .setDescription('[Admin] Configure le système de rôles perso (déblocage + fourchette de position)')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addRoleOption(option =>
      option.setName('role_deblocage').setDescription('Le rôle "Rôle Perso" donné par l\'autre bot (niveau 70)').setRequired(true)
    )
    .addRoleOption(option =>
      option.setName('plafond').setDescription('Les rôles perso restent toujours EN-DESSOUS de ce rôle').setRequired(true)
    )
    .addRoleOption(option =>
      option.setName('plancher').setDescription('Les rôles perso restent toujours AU-DESSUS de ce rôle').setRequired(true)
    ),

  async execute(interaction) {
    const unlockRole = interaction.options.getRole('role_deblocage');
    const topRole = interaction.options.getRole('plafond');
    const bottomRole = interaction.options.getRole('plancher');

    if (topRole.position <= bottomRole.position) {
      return interaction.reply({
        content: `❌ Le plafond (${topRole}) doit être positionné au-dessus du plancher (${bottomRole}) dans la hiérarchie des rôles.`,
        ephemeral: true,
      });
    }

    await GuildConfig.findOneAndUpdate(
      { guildId: interaction.guild.id },
      {
        guildId: interaction.guild.id,
        customRoleUnlockRoleId: unlockRole.id,
        customRoleTopRoleId: topRole.id,
        customRoleBottomRoleId: bottomRole.id,
      },
      { upsert: true }
    );

    const embed = new EmbedBuilder()
      .setColor(0x57F287)
      .setDescription(
        `✅ Configuration enregistrée :\n` +
        `• Déblocage : ${unlockRole} (ou statut Booster)\n` +
        `• Les rôles perso restent entre ${topRole} et ${bottomRole}`
      );

    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};
