const {
    SlashCommandBuilder,
    EmbedBuilder
} = require("discord.js");

const CasinoProfile =
    require("../models/CasinoProfile");
const updateClanYens =
    require("../systems/updateClanYens");
const allowedRoles = [
    "1506674274826584284",
    "1506709088451690708"
];

module.exports = {
    data: new SlashCommandBuilder()
        .setName("delcoins")
        .setDescription(
            "Retirer des yens à un joueur"
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

        const profile =
            await CasinoProfile.findOne({
                userId: user.id
            });

        if (!profile) {

            return interaction.reply({
                content:
                    "❌ Profil casino introuvable.",
                ephemeral: true
            });

        }

        profile.yens -= amount;

        if (profile.yens < 0)
            profile.yens = 0;

        await profile.save();
       try {

    await updateClanYens(
    target.id,
    -amount
);

} catch (err) {

    console.error(
        "[CLAN ERROR DELCOINS]",
        err
    );

}
  const embed =
            new EmbedBuilder()
                .setColor("Red")
                .setTitle(
                    "💴 Yens retirés"
                )
                .setDescription(
                    `❌ ${amount.toLocaleString()} ¥ retirés à ${user}`
                );

        return interaction.reply({
            embeds: [embed]
        });
    }
};
