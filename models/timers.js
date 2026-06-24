const {
    SlashCommandBuilder,
    EmbedBuilder
} = require("discord.js");

const CasinoProfile =
    require("../models/CasinoProfile");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("timers")
        .setDescription(
            "Voir les cooldowns casino"
        ),

    async execute(interaction) {

        const profile =
            await CasinoProfile.findOne({
                userId: interaction.user.id
            });

        if (!profile) {
            return interaction.reply({
                content:
                    "❌ Tu n'as pas encore de profil casino.",
                ephemeral: true
            });
        }

        const now = Date.now();

        const dailyCooldown =
            24 * 60 * 60 * 1000;

        const claimCooldown =
            20 * 60 * 1000;

        const availableEmoji =
    "<:casino:1507449720673669261>";

let dailyText =
    `${availableEmoji} Disponible`;

let claimText =
    `${availableEmoji} Disponible`;

        if (profile.lastDaily) {

            const remaining =
                dailyCooldown -
                (
                    now -
                    new Date(
                        profile.lastDaily
                    ).getTime()
                );

            if (remaining > 0) {

                const next =
                    Math.floor(
                        (
                            new Date(
                                profile.lastDaily
                            ).getTime()
                            + dailyCooldown
                        ) / 1000
                    );

                dailyText =
                    `<t:${next}:R>`;
            }
        }

        if (profile.lastClaim) {

            const remaining =
                claimCooldown -
                (
                    now -
                    profile.lastClaim
                );

            if (remaining > 0) {

                const next =
                    Math.floor(
                        (
                            profile.lastClaim
                            + claimCooldown
                        ) / 1000
                    );

                claimText =
                    `<t:${next}:R>`;
            }
        }

        const embed =
            new EmbedBuilder()
                .setColor("#00BFFF")
                .setTitle(
                    "⏳ Timers Casino"
                )
                .addFields(
                    {
                        name: "🎁 Daily",
                        value: dailyText,
                        inline: true
                    },
                    {
                        name: "💰 Claim",
                        value: claimText,
                        inline: true
                    }
                )
                .setFooter({
                    text:
                        interaction.user.username
                });

        return interaction.reply({
            embeds: [embed],
            ephemeral: true
        });
    }
};
