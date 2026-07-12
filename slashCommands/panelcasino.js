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

const ALLOWED_ROLE = "1506674274826584284";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("panelcasino")
        .setDescription("Affiche le panel casino"),

    async execute(interaction) {

        if (
            !interaction.member.roles.cache.has(
                ALLOWED_ROLE
            )
        ) {
            return interaction.reply({
                content: "❌ Vous n'avez pas la permission.",
                ephemeral: true
            });
        }

        const container = new ContainerBuilder()
            .setAccentColor(0x2B2D31)
            .addTextDisplayComponents(
                new TextDisplayBuilder().setContent("**L'équipe Shiiro**")
            )
            .addTextDisplayComponents(
                new TextDisplayBuilder().setContent("## Affiche présentation Casino")
            )
            .addSeparatorComponents(
                new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
            )
            .addTextDisplayComponents(
                new TextDisplayBuilder().setContent(
                    `Bienvenue dans le casino de Shiiro !!!\n\n` +
                    `Ici vous trouverez pas mal de mini jeux amusants ainsi que pleins de récompenses\n\n` +
                    `**Gardez une chose essentielle en tête soyez audacieux mais pas trop non plus !!!**\n\n` +
                    `Vous trouverez ici bas la boutique du serveur :`
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
                        .setCustomId("create_profile")
                        .setLabel("Créer mon profil")
                        .setEmoji("💹")
                        .setStyle(ButtonStyle.Primary)
                )
            );

        await interaction.channel.send({
            components: [container],
            flags: MessageFlags.IsComponentsV2
        });

        await interaction.reply({
            content: "✅ Panel casino envoyé.",
            ephemeral: true
        });
    }
};
