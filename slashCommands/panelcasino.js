const {
    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
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

        const embed = new EmbedBuilder()
            .setColor("#2B2D31")
            .setAuthor({
                name: "L'équipe Shiiro"
            })
            .setTitle("Affiche présentation Casino")
            .setDescription(
`Bienvenue dans le casino de Shiiro !!!

Ici vous trouverez pas mal de mini jeux amusants ainsi que pleins de récompenses

**Gardez une chose essentielle en tête soyez audacieux mais pas trop non plus !!!**

Vous trouverez ici bas la boutique du serveur :`
            )
            .setImage(
                "https://cdn.discordapp.com/attachments/1504557264311292036/1519046386337972377/FA548C65-1804-4C87-88B8-598D73C37DEB.png"
            );

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId("create_profile")
                    .setLabel("Créer mon profil")
                    .setEmoji("🎰")
                    .setStyle(ButtonStyle.Primary)
            );

        await interaction.channel.send({
            embeds: [embed],
            components: [row]
        });

        await interaction.reply({
            content: "✅ Panel casino envoyé.",
            ephemeral: true
        });
    }
};
