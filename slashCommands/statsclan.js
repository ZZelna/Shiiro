const {
    SlashCommandBuilder,
    EmbedBuilder
} = require("discord.js");

const Clan =
    require("../models/Clan");

const CasinoProfile =
    require("../models/CasinoProfile");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("statsclan")
        .setDescription(
            "Afficher les statistiques du clan"
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

        const profiles =
            await CasinoProfile.find({
                userId: {
                    $in: clan.members
                }
            });

        profiles.sort(
            (a, b) =>
                b.yens - a.yens
        );

        let description = "";

        for (
            let i = 0;
            i < profiles.length;
            i++
        ) {

            const user =
                await interaction.client.users
                    .fetch(
                        profiles[i].userId
                    )
                    .catch(() => null);

            const username =
                user
                    ? user.username
                    : "Inconnu";

            description +=
`**${i + 1}. ${username}**
💴 ${profiles[i].yens.toLocaleString()} ¥

`;
        }

        const totalYens =
            profiles.reduce(
                (sum, profile) =>
                    sum +
                    (profile.yens || 0),
                0
            );

        const embed =
            new EmbedBuilder()
                .setColor("Blue")
                .setTitle(
                    `📊 ${clan.name}`
                )
                .setDescription(
                    description
                )
                .addFields(
{
    name:
        "⚔️ Score GDC",
    value:
        `${clan.weeklyYens.toLocaleString()} ¥`,
    inline: false
},
{
    name:
        "💰 Total Clan",
    value:
        `${clan.totalYens.toLocaleString()} ¥`,
    inline: false
}
)
                })
                .setTimestamp();

        await interaction.reply({
            embeds: [embed],
            ephemeral: true
        });

    }
};
