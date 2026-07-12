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

module.exports = {
    data: new SlashCommandBuilder()
        .setName("panelgdc")
        .setDescription("Affiche le panel Guerre de Clans"),

    async execute(interaction) {

        const roleAllowed =
            "1506674274826584284";

        if (
            !interaction.member.roles.cache.has(
                roleAllowed
            )
        ) {
            return interaction.reply({
                content:
                    "❌ Tu n'as pas la permission d'utiliser cette commande.",
                ephemeral: true
            });
        }

        const container = new ContainerBuilder()
            .setAccentColor(0x0099ff)
            .addTextDisplayComponents(
                new TextDisplayBuilder().setContent("## ⚔️ Guerre de Clans Casino")
            )
            .addSeparatorComponents(
                new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
            )
            .addTextDisplayComponents(
                new TextDisplayBuilder().setContent(
                    "### 💴 Création d'un Clan\n\n" +
                    "> Créer un clan coûte **10 000 ¥**\n\n" +
                    "> Le but de la Guerre de Clans est simple :\n" +
                    "> accumuler le plus de **Yens** possible."
                )
            )
            .addTextDisplayComponents(
                new TextDisplayBuilder().setContent(
                    "🏆 **Membre gagnant :**\n" +
                    "Le joueur possédant le plus de Yens.\n\n" +
                    "👑 **Clan gagnant :**\n" +
                    "Le clan possédant le plus de Yens.\n\n" +
                    "Clique sur le bouton ci-dessous pour créer ton clan."
                )
            )
            .addMediaGalleryComponents(
                new MediaGalleryBuilder().addItems(
                    new MediaGalleryItemBuilder().setURL(
                        "https://cdn.discordapp.com/attachments/1516131929244696586/1520890841244238015/0216B92A-B9BC-4E06-AFC8-21DB87AFE040.png?ex=6a42d779&is=6a4185f9&hm=2cef2fb45cd38c0eb36385459551b4e86f4369d1e445998235ab60c598329e3c&"
                    )
                )
            )
            .addSeparatorComponents(
                new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
            )
            .addTextDisplayComponents(
                new TextDisplayBuilder().setContent("-# Shiiro Casino • Guerre de Clans")
            )
            .addActionRowComponents(
                new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId("create_clan")
                        .setLabel("Créer un clan")
                        .setEmoji("⚔️")
                        .setStyle(ButtonStyle.Primary)
                )
            );

        await interaction.reply({
            components: [container],
            flags: MessageFlags.IsComponentsV2
        });
    }
};
