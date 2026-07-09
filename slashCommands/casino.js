const {
    SlashCommandBuilder,
    EmbedBuilder
} = require("discord.js");

const CasinoProfile =
    require("../models/CasinoProfile");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("casino")
        .setDescription(
            "Afficher votre profil casino"
        ),

    async execute(interaction) {
  const ALLOWED_CHANNEL = "1523677940750225508";

    if (interaction.channelId !== ALLOWED_CHANNEL) {

        return interaction.reply({

            content: "❌ Cette commande est uniquement utilisable dans <#1523677940750225508>.",

            ephemeral: true

        });

    }

    const profile =

        await CasinoProfile.findOne({

            userId: interaction.user.id

        })

        if (!profile) {
            return interaction.reply({
                content:
                    "❌ Tu n'as pas encore créé ton profil casino.",
                ephemeral: true
            });
        }

        const embed =
            new EmbedBuilder()
                .setColor("#00BFFF")
                .setAuthor({
                    name: `${interaction.user.username} • Profil Casino`,
                    iconURL:
                        interaction.user.displayAvatarURL()
                })
                .setThumbnail(
                    interaction.user.displayAvatarURL()
                )
                .addFields(
                    {
                        name: "💴 Yens",
                        value:
                            `${profile.yens.toLocaleString()} ¥`,
                        inline: true
                    },
                    {
                        name: "🎁 Gifts",
                        value:
                            `${profile.gifts.toLocaleString()}`,
                        inline: true
                    }
                )
                .setFooter({
                    text:
                        "Shiiro Casino"
                })
                .setTimestamp();

       return interaction.reply({
    embeds: [embed],
    ephemeral: true
});
    }
};
