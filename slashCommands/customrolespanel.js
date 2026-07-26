const {
    SlashCommandBuilder,
    PermissionFlagsBits,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");

const STAFF_ROLE_ID = "1506674274826584284";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("customrolespanel")
        .setDescription("Ouvre le panneau de gestion des rôles personnalisés")
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

    async execute(interaction) {

        if (!interaction.member.roles.cache.has(STAFF_ROLE_ID)) {
            return interaction.reply({
                content: "❌ Vous n'avez pas accès à ce panneau.",
                ephemeral: true
            });
        }

        const embed = new EmbedBuilder()
            .setColor("#5865F2")
            .setTitle("🎛️ Gestion des rôles personnalisés")
            .setDescription(
                [
                    "Bienvenue dans le **centre d'administration des rôles personnalisés**.",
                    "",
                    "Sélectionnez une action à effectuer à l'aide des boutons ci-dessous."
                ].join("\n")
            )
            .setFooter({
                text: "Shiiro • Gestion des rôles personnalisés"
            })
            .setTimestamp();

        const row1 = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId("customroles:list")
                .setLabel("Liste")
                .setEmoji("📋")
                .setStyle(ButtonStyle.Primary),

            new ButtonBuilder()
                .setCustomId("customroles:search")
                .setLabel("Rechercher")
                .setEmoji("🔍")
                .setStyle(ButtonStyle.Success),

            new ButtonBuilder()
                .setCustomId("customroles:delete")
                .setLabel("Supprimer")
                .setEmoji("🗑️")
                .setStyle(ButtonStyle.Danger)
        );

        const row2 = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId("customroles:repair")
                .setLabel("Réparer")
                .setEmoji("🛠️")
                .setStyle(ButtonStyle.Secondary),

            new ButtonBuilder()
                .setCustomId("customroles:stats")
                .setLabel("Statistiques")
                .setEmoji("📊")
                .setStyle(ButtonStyle.Secondary),

            new ButtonBuilder()
                .setCustomId("customroles:sync")
                .setLabel("Synchroniser")
                .setEmoji("🔄")
                .setStyle(ButtonStyle.Secondary)
        );

        const row3 = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId("customroles:export")
                .setLabel("Exporter")
                .setEmoji("📤")
                .setStyle(ButtonStyle.Secondary),

            new ButtonBuilder()
                .setCustomId("customroles:import")
                .setLabel("Importer")
                .setEmoji("📥")
                .setStyle(ButtonStyle.Secondary),

            new ButtonBuilder()
                .setCustomId("customroles:transfer")
                .setLabel("Transférer")
                .setEmoji("👑")
                .setStyle(ButtonStyle.Secondary)
        );

        const row4 = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId("customroles:rename")
                .setLabel("Renommer")
                .setEmoji("✏️")
                .setStyle(ButtonStyle.Secondary),

            new ButtonBuilder()
                .setCustomId("customroles:edit")
                .setLabel("Modifier")
                .setEmoji("🎨")
                .setStyle(ButtonStyle.Secondary)
        );

        await interaction.reply({
            embeds: [embed],
            components: [
                row1,
                row2,
                row3,
                row4
            ]
        });
    }
};
