const {
    SlashCommandBuilder,
    EmbedBuilder
} = require("discord.js");

const CasinoProfile =
    require("../models/CasinoProfile");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("topcasino")
        .setDescription(
            "Affiche le top 10 des joueurs casino"
        ),

    async execute(interaction) {

        const users =
            await CasinoProfile.find()
                .sort({
                    yens: -1
                })
                .limit(10);

        if (!users.length) {

            return interaction.reply({
                content:
                    "❌ Aucun profil casino trouvé.",
                ephemeral: true
            });

        }

        const medals = [
            "🥇",
            "🥈",
            "🥉"
        ];

        const maxYens =
            users[0].yens;

        let description = "";

        for (
            let i = 0;
            i < users.length;
            i++
        ) {

            const discordUser =
                await interaction.client.users
                    .fetch(users[i].userId)
                    .catch(() => null);

            const username =
                discordUser
                    ? discordUser.username
                    : "Utilisateur inconnu";

            const rank =
                medals[i] ||
                `#${i + 1}`;

            const percent =
                users[i].yens / maxYens;

            const filled =
                Math.max(
                    1,
                    Math.round(percent * 10)
                );

            const bar =
                "🟩".repeat(filled) +
                "⬜".repeat(
                    10 - filled
                );

            description +=
`${rank} **${username}**
${bar}
💴 **${users[i].yens.toLocaleString()} ¥**

`;
        }

        const embed =
            new EmbedBuilder()
                .setColor("Blue")
                .setTitle(
                    "🏆 Top Casino"
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
