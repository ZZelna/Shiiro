const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const PrestigeConfig = require('../models/PrestigeConfig');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setup-prestige-roles')
    .setDescription('Associe un rôle Discord à un ou plusieurs paliers de prestige')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
    .addRoleOption(o => o.setName('role1').setDescription('Rôle Prestige I').setRequired(false))
    .addRoleOption(o => o.setName('role2').setDescription('Rôle Prestige II').setRequired(false))
    .addRoleOption(o => o.setName('role3').setDescription('Rôle Prestige III').setRequired(false))
    .addRoleOption(o => o.setName('role4').setDescription('Rôle Prestige IV').setRequired(false))
    .addRoleOption(o => o.setName('role5').setDescription('Rôle Prestige V').setRequired(false))
    .addRoleOption(o => o.setName('role6').setDescription('Rôle Prestige VI').setRequired(false))
    .addRoleOption(o => o.setName('role7').setDescription('Rôle Prestige VII').setRequired(false))
    .addRoleOption(o => o.setName('role8').setDescription('Rôle Prestige VIII').setRequired(false))
    .addRoleOption(o => o.setName('role9').setDescription('Rôle Prestige IX').setRequired(false))
    .addRoleOption(o => o.setName('role10').setDescription('Rôle Prestige X').setRequired(false)),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    let config = await PrestigeConfig.findOne({ guildId: interaction.guild.id });
    if (!config) {
      config = await PrestigeConfig.create({ guildId: interaction.guild.id });
    }

    const updated = [];
    for (let tier = 1; tier <= 10; tier++) {
      const role = interaction.options.getRole(`role${tier}`);
      if (role) {
        config.roles[tier - 1] = role.id;
        updated.push(`Prestige ${toRoman(tier)} → ${role}`);
      }
    }

    if (updated.length === 0) {
      const summary = config.roles
        .map((r, i) => `Prestige ${toRoman(i + 1)} : ${r ? `<@&${r}>` : '_non configuré_'}`)
        .join('\n');
      return interaction.editReply({
        embeds: [new EmbedBuilder().setColor(0x5865F2).setTitle('🏅 Rôles de prestige').setDescription(summary)],
      });
    }

    await config.save();

    const embed = new EmbedBuilder()
      .setColor(0x57F287)
      .setTitle('✅ Rôles de prestige mis à jour')
      .setDescription(updated.join('\n'));

    await interaction.editReply({ embeds: [embed] });
  },
};

function toRoman(num) {
  const map = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];
  return map[num - 1] ?? num;
}
