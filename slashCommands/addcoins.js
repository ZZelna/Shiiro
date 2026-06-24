const {
    SlashCommandBuilder,
    EmbedBuilder
} = require("discord.js");

const CasinoProfile =
    require("../models/CasinoProfile");

const allowedRoles = [
    "1506674274826584284",
    "1506709088451690708"
];

module.exports = {
    data: new SlashCommandBuilder()
        .setName("addcoins")
        .setDescription(
            "Ajouter des yens à un joueur"
        )
        .addUserOption(option =>
            option
                .setName("utilisateur")
                .setDescription(
                    "Joueur"
                )
                .setRequired(true)
        )
        .addIntegerOption(option =>
            option
                .setName("montant")
                .setDescription(
                    "Montant"
                )
                .setRequired(true)
        ),

    async execute(interaction) {

        if (
            !interaction.member.roles.cache.some(
                role =>
                    allowedRoles.includes(
                        role.id
                    )
            )
        ) {
            return interaction.reply({
                content:
                    "❌ Permission refusée.",
                ephemeral: true
            });
        }

        const user =
            interaction.options.getUser(
                "utilisateur"
            );

        const amount =
            interaction.options.getInteger(
                "montant"
            );

        let profile =
            await CasinoProfile.findOne({
                userId: user.id
            });

        if (!profile) {

            profile =
                await CasinoProfile.create({
                    userId: user.id,
                    yens: 0,
                    gifts: 0
                });

        }

        profile.yens += amount;

        await profile.save();
        const updateClanYens =
require("../utils/updateClanYens");

await updateClanYens(
    user.id
);

        const embed =
            new EmbedBuilder()
                .setColor("Green")
                .setTitle(
                    "💴 Yens ajoutés"
                )
                .setDescription(
                    `✅ ${user} reçoit **${amount.toLocaleString()} ¥**`
                );

        return interaction.reply({
            embeds: [embed]
        });
    }
};
