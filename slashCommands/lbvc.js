const {
    SlashCommandBuilder,
    EmbedBuilder
} = require("discord.js");

const VoiceStats =
require("../models/VoiceStats");

module.exports = {

    data:
        new SlashCommandBuilder()
        .setName("lbvc")
        .setDescription(
            "Leaderboard vocal 24h"
        ),

    async execute(interaction) {

        const allowedRole =
            "1506674274826584284";

        if (
            !interaction.member.roles.cache.has(
                allowedRole
            )
        ) {

            return interaction.reply({
                content:
                    "❌ Tu n'as pas la permission.",
                ephemeral: true
            });

        }

        const stats =
            await VoiceStats.find()
            .sort({
                totalSeconds: -1
            })
            .limit(10);

        if (!stats.length) {

            return interaction.reply({
                content:
                    "❌ Aucun temps vocal enregistré.",
                ephemeral: true
            });

        }

        const voiceJoins =
            global.voiceJoins ||
            new Map();

        let description = "";

        for (
            let i = 0;
            i < stats.length;
            i++
        ) {

            let totalSeconds =
                stats[i].totalSeconds;

            const joinTime =
                voiceJoins.get(
                    stats[i].userId
                );

            if (joinTime) {

                totalSeconds +=
                    Math.floor(
                        (
                            Date.now() -
                            joinTime
                        ) / 1000
                    );

            }

            const user =
                await interaction.client.users
                    .fetch(
                        stats[i].userId
                    )
                    .catch(
                        () => null
                    );

            const hours =
                Math.floor(
                    totalSeconds /
                    3600
                );

            const minutes =
                Math.floor(
                    (
                        totalSeconds %
                        3600
                    ) / 60
                );

            description +=
                `${i + 1}. ${user ? user.username : "Inconnu"}\n🎤 ${hours}h ${minutes}m\n\n`;

        }

        const embed =
            new EmbedBuilder()
                .setColor("Blue")
                .setTitle(
                    "🎤 Leaderboard Vocal (24h)"
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
