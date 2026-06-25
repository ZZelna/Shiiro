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

const clansWithYens = clans
    .map(clan => ({
        clan,
        weeklyYens: clan.weeklyYens || 0
    }))
    .sort(
        (a, b) =>
            b.weeklyYens -
            a.weeklyYens
    );

clansWithYens.forEach(
    (data, index) => {

        description +=
`${medals[index]} **${data.clan.name}**
⚔️ ${data.weeklyYens.toLocaleString()} ¥
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
