const {
    SlashCommandBuilder,
    EmbedBuilder
} = require("discord.js");

const Clan =
    require("../models/Clan");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("topclans")
        .setDescription(
            "Afficher le classement des clans"
        ),

    async execute(interaction) {

        const clans =
            await Clan.find()
                .sort({
                    totalYens: -1
                })
                .limit(5);

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

        clans.forEach(
            (clan, index) => {

                description +=
`${medals[index]} **${clan.name}**
💴 ${(clan.totalYens || 0).toLocaleString()} ¥
👥 ${clan.members.length}/10 membres

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
