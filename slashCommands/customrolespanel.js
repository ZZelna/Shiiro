const {
    SlashCommandBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ContainerBuilder,
    TextDisplayBuilder,
    SeparatorBuilder,
    SeparatorSpacingSize,
    MediaGalleryBuilder,
    MediaGalleryItemBuilder,
    MessageFlags
} = require("discord.js");

const CustomRole = require("../models/CustomRole");

const ALLOWED_ROLE = "1506674274826584284";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("customrolespanel")
        .setDescription("Affiche le panneau de gestion des rôles personnalisés"),

    async execute(interaction) {

        if (!interaction.member.roles.cache.has(ALLOWED_ROLE)) {
            return interaction.reply({
                content: "❌ Vous n'avez pas la permission.",
                ephemeral: true
            });
        }

        const roles = await CustomRole.find({
            guildId: interaction.guild.id
        });

        const totalRoles = roles.length;

        const owners = new Set(
            roles.map(r => r.userId)
        ).size;

        const sharedMembers = roles.reduce(
            (total, role) => total + (role.sharedWith?.length || 0),
            0
        );

        const container = new ContainerBuilder()
            .setAccentColor(0x5865F2)

            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent("## 🎨 Gestion des rôles personnalisés")
            )

            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent("**Centre d'administration Shiiro**")
            )

            .addSeparatorComponents(
                new SeparatorBuilder()
                    .setDivider(true)
                    .setSpacing(SeparatorSpacingSize.Small)
            )

            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(
                        "Bienvenue dans le panneau de gestion des **rôles personnalisés**.\n\n" +
                        "Depuis ce centre d'administration vous pouvez consulter, rechercher, modifier, supprimer, transférer et réparer tous les rôles personnalisés du serveur."
                    )
            )

            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(
                        `### 📊 Statistiques\n\n` +
                        `🎨 **Rôles personnalisés :** ${totalRoles}\n` +
                        `👑 **Propriétaires :** ${owners}\n` +
                        `👥 **Partages actifs :** ${sharedMembers}\n` +
                        `⚙️ **Commandes créées :** ${totalRoles}`
                    )
            )

            .addMediaGalleryComponents(
                new MediaGalleryBuilder().addItems(
                    new MediaGalleryItemBuilder().setURL(
                        "https://cdn.discordapp.com/attachments/1504557264311292036/1519046386337972377/FA548C65-1804-4C87-88B8-598D73C37DEB.png"
                    )
                )
            )

            .addActionRowComponents(
                new ActionRowBuilder().addComponents(

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
                        .setCustomId("customroles:create")
                        .setLabel("Créer")
                        .setEmoji("➕")
                        .setStyle(ButtonStyle.Secondary),

                    new ButtonBuilder()
                        .setCustomId("customroles:delete")
                        .setLabel("Supprimer")
                        .setEmoji("🗑️")
                        .setStyle(ButtonStyle.Danger)
                )
            )

            .addActionRowComponents(
                new ActionRowBuilder().addComponents(

                    new ButtonBuilder()
                        .setCustomId("customroles:rename")
                        .setLabel("Renommer")
                        .setEmoji("✏️")
                        .setStyle(ButtonStyle.Secondary),

                    new ButtonBuilder()
                        .setCustomId("customroles:edit")
                        .setLabel("Modifier")
                        .setEmoji("🎨")
                        .setStyle(ButtonStyle.Secondary),

                    new ButtonBuilder()
                        .setCustomId("customroles:transfer")
                        .setLabel("Transférer")
                        .setEmoji("👑")
                        .setStyle(ButtonStyle.Secondary),

                    new ButtonBuilder()
                        .setCustomId("customroles:sync")
                        .setLabel("Synchroniser")
                        .setEmoji("🔄")
                        .setStyle(ButtonStyle.Secondary)
                )
            )

            .addActionRowComponents(
                new ActionRowBuilder().addComponents(

                    new ButtonBuilder()
                        .setCustomId("customroles:stats")
                        .setLabel("Statistiques")
                        .setEmoji("📊")
                        .setStyle(ButtonStyle.Secondary),

                    new ButtonBuilder()
                        .setCustomId("customroles:repair")
                        .setLabel("Réparer")
                        .setEmoji("🛠️")
                        .setStyle(ButtonStyle.Secondary),

                    new ButtonBuilder()
                        .setCustomId("customroles:export")
                        .setLabel("Exporter")
                        .setEmoji("📤")
                        .setStyle(ButtonStyle.Secondary),

                    new ButtonBuilder()
                        .setCustomId("customroles:import")
                        .setLabel("Importer")
                        .setEmoji("📥")
                        .setStyle(ButtonStyle.Secondary)
                )
            );

        await interaction.channel.send({
            components: [container],
            flags: MessageFlags.IsComponentsV2
        });

        await interaction.reply({
            content: "✅ Panneau des rôles personnalisés envoyé.",
            ephemeral: true
        });

    }
};
