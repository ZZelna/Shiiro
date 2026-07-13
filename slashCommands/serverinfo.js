const {
    SlashCommandBuilder,
    ContainerBuilder,
    TextDisplayBuilder,
    SectionBuilder,
    SeparatorBuilder,
    SeparatorSpacingSize,
    MediaGalleryBuilder,
    MediaGalleryItemBuilder,
    MessageFlags
} = require("discord.js");

const BOOST_TIER_LABELS = {
    0: "Aucun niveau",
    1: "Niveau 1",
    2: "Niveau 2",
    3: "Niveau 3"
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName("serverinfo")
        .setDescription("Affiche les informations du serveur"),

    async execute(interaction) {

        const guild = interaction.guild;
        const owner = await guild.fetchOwner().catch(() => null);

        const onlineCount = guild.members.cache.filter(
            m => m.presence && m.presence.status !== "offline"
        ).size;

        const iconURL = guild.iconURL({ dynamic: true, size: 256 });
        const bannerURL = guild.bannerURL({ size: 1024 });

        const container = new ContainerBuilder()
            .setAccentColor(0x5865F2);

        // ─── En-tête avec icône du serveur ───────────────────────────────
        if (iconURL) {
            container.addSectionComponents(
                new SectionBuilder()
                    .addTextDisplayComponents(
                        new TextDisplayBuilder().setContent(`## ${guild.name}`)
                    )
                    .setThumbnailAccessory(
                        thumbnail => thumbnail.setURL(iconURL)
                    )
            );
        } else {
            container.addTextDisplayComponents(
                new TextDisplayBuilder().setContent(`## ${guild.name}`)
            );
        }

        container.addSeparatorComponents(
            new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
        );

        container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
                `**Propriétaire du serveur**\n${owner ? owner.user : "Inconnu"}`
            )
        );

        container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
                `**Identifiant**\n${guild.id}`
            )
        );

        if (guild.description) {
            container.addTextDisplayComponents(
                new TextDisplayBuilder().setContent(
                    `**Description**\n${guild.description}`
                )
            );
        }

        container.addSeparatorComponents(
            new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
        );

        container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
                `**Membres**\n${guild.memberCount.toLocaleString()}`
            )
        );

        container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
                `**Membres en ligne**\n${onlineCount.toLocaleString()}`
            )
        );

        container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
                `**État des boosts de serveur**\n` +
                `${guild.premiumSubscriptionCount || 0} Boosts (${BOOST_TIER_LABELS[guild.premiumTier] || "Inconnu"})`
            )
        );

        container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
                `**Rôles**\n${guild.roles.cache.size}`
            )
        );

        container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
                `**Salons**\n${guild.channels.cache.size}`
            )
        );

        container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
                `**Création du serveur**\n<t:${Math.floor(guild.createdTimestamp / 1000)}:F> (<t:${Math.floor(guild.createdTimestamp / 1000)}:R>)`
            )
        );

        container.addSeparatorComponents(
            new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
        );

        container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
                `**Émojis**\n${guild.emojis.cache.size} émoji(s) au total`
            )
        );

        // ─── Bannière du serveur en bas (si elle existe) ─────────────────
        if (bannerURL) {
            container.addSeparatorComponents(
                new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
            );
            container.addMediaGalleryComponents(
                new MediaGalleryBuilder().addItems(
                    new MediaGalleryItemBuilder().setURL(bannerURL)
                )
            );
        }

        return interaction.reply({
            components: [container],
            flags: MessageFlags.IsComponentsV2
        });
    }
};
