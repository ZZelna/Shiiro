const {
    SlashCommandBuilder,
    EmbedBuilder
} = require("discord.js");

const CasinoProfile = require("../models/CasinoProfile");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("daily")
        .setDescription("Récupère ta récompense quotidienne"),

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

        if (
            profile.lastDaily &&
            now - profile.lastDaily.getTime() <
                24 * 60 * 60 * 1000
        ) {

            const nextDaily =
                Math.floor(
                    (
                        profile.lastDaily.getTime() +
                        24 * 60 * 60 * 1000
                    ) / 1000
                );

            return interaction.reply({
                content:
                    `⏳ Tu as déjà récupéré ton daily.\nReviens <t:${nextDaily}:R>.`,
                ephemeral: true
            });
        }

        const reward =
    Math.floor(
        Math.random() * (5000 - 1000 + 1)
    ) + 1000;

        profile.yens += reward;
        profile.lastDaily = new Date();

        await profile.save();

        const embed =
    new EmbedBuilder()
        .setColor("Gold")
        .setTitle("🎁 Daily Casino")
        .setDescription(
            `Tu as reçu **${reward.toLocaleString()} ¥** !`
        )
        .addFields({
            name: "💴 Nouveau solde",
            value: `${profile.yens.toLocaleString()} ¥`
        });
        return interaction.reply({
            embeds: [embed],
            ephemeral: true
        });
    }
};
