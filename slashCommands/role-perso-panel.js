const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  MessageFlags,
} = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('role-perso-panel')
    .setDescription('[Admin] Poste le panneau de création de rôle perso dans ce salon')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  async execute(interaction) {
    const container = new ContainerBuilder().setAccentColor(0x5865F2);
    container.addTextDisplayComponents(new TextDisplayBuilder().setContent('### 🎨 Rôle perso'));
    container.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        'Crée ton rôle personnalisé (nom, couleur, icône) si tu remplis une de ces conditions :\n' +
        '• Avoir le rôle **Rôle Perso** (débloqué au niveau 70)\n' +
        '• Être **Booster** du serveur'
      )
    );
    container.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small));
    container.addTextDisplayComponents(
      new TextDisplayBuilder().setContent('-# Un seul rôle perso par joueur — recréer un rôle modifie l\'existant.')
    );

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('customrole_create').setLabel('Créer / modifier mon rôle').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId('customrole_delete').setLabel('Supprimer mon rôle perso').setStyle(ButtonStyle.Danger),
    );
    container.addActionRowComponents(row);

    await interaction.channel.send({ flags: MessageFlags.IsComponentsV2, components: [container] });
    await interaction.reply({ content: '✅ Panneau posté.', ephemeral: true });
  },
};
