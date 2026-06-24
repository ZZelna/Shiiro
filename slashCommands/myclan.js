const {
    SlashCommandBuilder,
    EmbedBuilder
} = require("discord.js");

const Clan =
    require("../models/Clan");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("myclan")
        .setDescription(
            "Afficher les informations de votre clan"
        ),

    async execute(interaction) {

        const clan =
            await Clan.findOne({
                members:
                interaction.user.id
            });

        if (!clan) {

            return interaction.reply({
                content:
                    "❌ Tu n'es dans aucun clan.",
                ephemeral: true
            });

        }

        const members =
            clan.members
                .map(id => `<@${id}>`)
                .join("\n");

        const embed =
            new EmbedBuilder()
                .setColor("Blue")
                .setTitle(
                    `🏰 ${clan.name}`
                )
                .addFields(
                    {
                        name: "👑 Chef",
                        value:
                            `<@${clan.ownerId}>`,
                        inline: true
                    },
                    {
                        name: "👥 Membres",
                        value:
                            `${clan.members.length}/10`,
                        inline: true
                    },
                    {
                        name: "💴 Yens du Clan",
                        value:
                          const CasinoProfile =
require("../models/CasinoProfile");

const profiles =
await CasinoProfile.find({
    userId: {
        $in: clan.members
    }
});

const totalYens =
profiles.reduce(
    (sum, profile) =>
        sum + (profile.yens || 0),
    0
);
                        inline: true
                    },
                    {
                        name: "📍 Salon",
                        value:
                            clan.channelId
                                ? `<#${clan.channelId}>`
                                : "Aucun",
                        inline: false
                    },
                    {
                        name: "📜 Liste des membres",
                        value:
                            members || "Aucun membre",
                        inline: false
                    }
                )
                .setTimestamp();

        await interaction.reply({
            embeds: [embed],
            ephemeral: true
        });

    }
};
