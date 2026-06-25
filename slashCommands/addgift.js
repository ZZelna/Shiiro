const {
    SlashCommandBuilder,
    EmbedBuilder
} = require("discord.js");

const CasinoProfile =
require("../models/CasinoProfile");

module.exports = {

    data: new SlashCommandBuilder()
        .setName("addgift")
        .setDescription(
            "Ajouter un gift à un joueur"
        )
        .addUserOption(option =>
            option
                .setName("joueur")
                .setDescription(
                    "Joueur"
                )
                .setRequired(true)
        ),

    async execute(interaction) {

        const roles =
        [
            "1506709088451690708",
            "1506674274826584284"
        ];

        if (
            !roles.some(role =>
                interaction.member.roles.cache.has(
                    role
                )
            )
        ) {

            return interaction.reply({
                content:
                "❌ Permission refusée.",
                ephemeral: true
            });

        }

        const target =
        interaction.options.getUser(
            "joueur"
        );

        let profile =
        await CasinoProfile.findOne({
            userId:
            target.id
        });

        if (!profile) {

            profile =
            await CasinoProfile.create({
                userId:
                target.id
            });

        }

        profile.gifts += 1;

        await profile.save();

        const embed =
        new EmbedBuilder()
        .setColor("Green")
        .setTitle("🎁 Gift ajouté")
        .setDescription(
            `${target} possède maintenant **${profile.gifts} Gifts**`
        );

        return interaction.reply({
            embeds: [embed]
        });

    }

};
