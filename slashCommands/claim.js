const {
    SlashCommandBuilder,
    EmbedBuilder
} = require("discord.js");

const CasinoProfile =
    require("../models/CasinoProfile");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("claim")
        .setDescription(
            "Réclame une récompense toutes les 20 minutes"
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

        const cooldown =
            20 * 60 * 1000; // 20 min

        const now = Date.now();

        if (
            profile.lastClaim &&
            now - profile.lastClaim < cooldown
        ) {

            const remaining =
                Math.ceil(
                    (cooldown -
                        (now - profile.lastClaim)) /
                        60000
                );

            return interaction.reply({
                content:
                    `⏳ Tu pourras refaire un claim dans **${remaining} min**.`,
                ephemeral: true
            });
        }

        const reward =
            Math.floor(
                Math.random() * (500 - 100 + 1)
            ) + 100;

        profile.yens += reward;
        profile.lastClaim = now;

       await profile.save();

try {

    await updateClanYens(
        interaction.user.id
    );

} catch (err) {

    console.error(
        "[CLAN ERROR]",
        err
    );

}

const embed =
    new EmbedBuilder()
                .setColor("Gold")
                .setTitle("💰 Claim Casino")
                .setDescription(
                    `Tu as gagné **${reward} ¥** !`
                )
                .addFields({
                    name: "💴 Solde actuel",
                    value:
                        `${profile.yens.toLocaleString()} ¥`
                });

        return interaction.reply({
            embeds: [embed],
            ephemeral: true
        });
    }
};
