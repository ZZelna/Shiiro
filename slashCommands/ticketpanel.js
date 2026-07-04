const {
    SlashCommandBuilder,
    PermissionFlagsBits,
    ActionRowBuilder,
    StringSelectMenuBuilder,
    EmbedBuilder
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

        const embed = new EmbedBuilder()
            .setColor("#5865F2")
            .setTitle("🎫 Centre de support")
            .setDescription(
                [
                    "Bienvenue sur le centre de support.",
                    "",
                    "Choisissez la catégorie correspondant à votre demande à l'aide du menu ci-dessous.",
                    "",
                    "• 🚨 Gestion abus",
                    "• 👮 Gestion staff",
                    "• 🤝 Équipe partenariats",
                    "• 🎰 Gestion casino",
                    "• 🛠️ Support admin"
                ].join("\n")
            )
            .setFooter({
                text: `${interaction.guild.name} • Système de tickets`
            })
            .setTimestamp();

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

        const row = new ActionRowBuilder().addComponents(menu);
                await interaction.channel.send({
            embeds: [embed],
            components: [row]
        });

        await interaction.reply({
            content: "✅ Le panneau de tickets a été envoyé.",
            ephemeral: true
        });
    }
};
        
