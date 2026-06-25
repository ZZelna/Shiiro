const {
    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");

module.exports = {

    data: new SlashCommandBuilder()
        .setName("gift")
        .setDescription(
            "Ouvrir un cadeau aléatoire"
        ),

    async execute(interaction) {

        const embed =
            new EmbedBuilder()
                .setColor("Gold")
                .setTitle("🎁 Gift Casino")
                .setDescription(
                    "Une récompense aléatoire t'attend.\n\nClique sur **Ouvrir**."
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
