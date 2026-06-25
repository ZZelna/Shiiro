const {
SlashCommandBuilder,
EmbedBuilder,
ActionRowBuilder,
ButtonBuilder,
ButtonStyle
} = require("discord.js");

const CasinoProfile =
require("../models/CasinoProfile");

module.exports = {
data: new SlashCommandBuilder()
    .setName("gift")
    .setDescription(
        "Ouvrir un cadeau aléatoire"
    ),

async execute(interaction) {

    const profile =
    await CasinoProfile.findOne({
        userId:
        interaction.user.id
    });

    if (
        !profile ||
        profile.gifts <= 0
    ) {

        return interaction.reply({
            content:
            "❌ Tu ne possèdes aucun Gift.",
            ephemeral: true
        });

    }

    const embed =
    new EmbedBuilder()
        .setColor("Gold")
        .setTitle("🎁 Gift Casino")
        .setDescription(
            `Tu possèdes actuellement **${profile.gifts} Gift(s)**.\n\nClique sur **Ouvrir** pour découvrir ta récompense.`
        )
        .setImage(
            "https://cdn.discordapp.com/attachments/1516128872243134696/1519637866391797790/IMG_8903.png"
        );

    const row =
    new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId(
                    `gift_open_${interaction.user.id}`
                )
                .setLabel("Ouvrir")
                .setEmoji("🎁")
                .setStyle(
                    ButtonStyle.Success
                )
        );

    return interaction.reply({
        embeds: [embed],
        components: [row]
    });

}
};
