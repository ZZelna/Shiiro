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
        .setName("topclans")
        .setDescription(
            "Afficher le classement des clans"
        ),

    async execute(interaction) {

        const clans =
            await Clan.find()
               
 if (!clans.length) {

            return interaction.reply({
                content:
                    "❌ Aucun clan trouvé.",
                ephemeral: true
            });

        }

        const medals = [
            "🥇",
            "🥈",
            "🥉",
            "🏅",
            "🏅"
        ];

        let description = "";

const clansWithYens = [];

for (const clan of clans) {

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

    clansWithYens.push({
        clan,
        totalYens
    });

}

clansWithYens.sort(
    (a, b) =>
        b.totalYens -
        a.totalYens
);

clansWithYens.forEach(
    (data, index) => {

        description +=
`${medals[index]} **${data.clan.name}**
💴 ${data.totalYens.toLocaleString()} ¥
👥 ${data.clan.members.length}/10 membres

`;
    }
);

        const embed =
            new EmbedBuilder()
                .setColor("Gold")
                .setTitle(
                    "⚔️ Top 5 Clans"
                )
                .setDescription(
                    description
                )
                .setTimestamp();

        await interaction.reply({
            embeds: [embed]
        });

    }
};
