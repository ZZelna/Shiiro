const {
    SlashCommandBuilder,
    PermissionFlagsBits,
    ActionRowBuilder,
    StringSelectMenuBuilder,
    ContainerBuilder,
    TextDisplayBuilder,
    SeparatorBuilder,
    SeparatorSpacingSize,
    MessageFlags
} = require("discord.js");

const CATEGORIES = [
    {
        id: "abus",
        label: "Gestion abus",
        description: "Signaler un abus",
        emoji: "🚨"
    },
    {
        id: "staff",
        label: "Gestion staff",
        description: "Contacter le staff",
        emoji: "👮"
    },
    {
        id: "partenariat",
        label: "Équipe partenariats",
        description: "Faire une demande de partenariat",
        emoji: "🤝"
    },
    {
        id: "casino",
        label: "Gestion casino",
        description: "Support du casino",
        emoji: "🎰"
    },
    {
        id: "admin",
        label: "Support admin",
        description: "Contacter l'administration",
        emoji: "🛠️"
    }
];

module.exports = {
    data: new SlashCommandBuilder()
        .setName("ticketpanel")
        .setDescription("Créer le panneau de tickets")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
      async execute(interaction) {

        const container = new ContainerBuilder()
            .setAccentColor(0x5865F2)
            .addTextDisplayComponents(
                new TextDisplayBuilder().setContent("## 🎫 Centre de support")
            )
            .addTextDisplayComponents(
                new TextDisplayBuilder().setContent(
                    "Bienvenue sur le centre de support.\n\n" +
                    "Choisissez la catégorie correspondant à votre demande à l'aide du menu ci-dessous."
                )
            )
            .addSeparatorComponents(
                new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
            )
            .addTextDisplayComponents(
                new TextDisplayBuilder().setContent(
                    "🚨 Gestion abus\n" +
                    "👮 Gestion staff\n" +
                    "🤝 Équipe partenariats\n" +
                    "🎰 Gestion casino\n" +
                    "🛠️ Support admin"
                )
            )
            .addSeparatorComponents(
                new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
            )
            .addTextDisplayComponents(
                new TextDisplayBuilder().setContent(
                    `-# ${interaction.guild.name} • Système de tickets`
                )
            );

        const menu = new StringSelectMenuBuilder()
            .setCustomId("ticket_category")
            .setPlaceholder("📂 Sélectionnez une catégorie")
            .addOptions(
                CATEGORIES.map(category => ({
                    label: category.label,
                    description: category.description,
                    value: category.id,
                    emoji: category.emoji
                }))
            );

        container.addActionRowComponents(
            new ActionRowBuilder().addComponents(menu)
        );

        await interaction.channel.send({
            components: [container],
            flags: MessageFlags.IsComponentsV2
        });

        await interaction.reply({
            content: "✅ Le panneau de tickets a été envoyé.",
            ephemeral: true
        });
    }
};
