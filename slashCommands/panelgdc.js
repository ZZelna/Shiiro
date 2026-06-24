const {
    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
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

        const embed = new EmbedBuilder()
            .setColor("#0099ff")
            .setTitle("⚔️ Guerre de Clans Casino")
            .setDescription(
                [
                    "## 💴 Création d'un Clan",
                    "",
                    "> Créer un clan coûte **10 000 ¥**",
                    "",
                    "> Le but de la Guerre de Clans est simple :",
                    "> accumuler le plus de **Yens** possible.",
                    "",
                    "🏆 **Membre gagnant :**",
                    "Le joueur possédant le plus de Yens.",
                    "",
                    "👑 **Clan gagnant :**",
                    "Le clan possédant le plus de Yens.",
                    "",
                    "Clique sur le bouton ci-dessous pour créer ton clan."
                ].join("\n")
            )
            .setImage(
                "https://cdn.discordapp.com/attachments/1512167770286985319/1519241022641799228/0216B92A-B9BC-4E06-AFC8-21DB87AFE040.png"
            )
            .setFooter({
                text: "Shiiro Casino • Guerre de Clans"
            });

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId("create_clan")
                    .setLabel("Créer un clan")
                    .setEmoji("⚔️")
                    .setStyle(ButtonStyle.Primary)
            );

        await interaction.reply({
            embeds: [embed],
            components: [row]
        });
    }
};
