const {
    SlashCommandBuilder,
    EmbedBuilder
} = require("discord.js");

const GlobalBlacklist =
require("../models/GlobalBlacklist");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("bl")
        .setDescription(
            "Blacklist globale un utilisateur"
        )
        .addUserOption(option =>
            option
                .setName("joueur")
                .setDescription(
                    "Utilisateur à blacklist"
                )
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName("raison")
                .setDescription(
                    "Raison de la blacklist"
                )
                .setRequired(true)
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
                "❌ Tu n'as pas la permission d'utiliser cette commande.",
                ephemeral: true
            });

        }

        const target =
        interaction.options.getUser(
            "joueur"
        );

        const reason =
        interaction.options.getString(
            "raison"
        );

        const existing =
        await GlobalBlacklist.findOne({
            userId: target.id
        });

        if (existing) {

            return interaction.reply({
                content:
                "❌ Cet utilisateur est déjà blacklisté globalement.",
                ephemeral: true
            });

        }

        await GlobalBlacklist.create({
            userId: target.id,
            reason: reason,
            moderatorId:
            interaction.user.id
        });

        try {

            await interaction.guild.members.ban(
                target.id,
                {
                    reason:
                    `[BL] ${reason}`
                }
            );

        } catch (err) {

            console.log(err);

        }

        const embed =
        new EmbedBuilder()
            .setColor("Red")
            .setTitle(
                "⛔ Blacklist Globale"
            )
            .setDescription(
                `${target} a été blacklisté globalement.`
            )
            .addFields(
                {
                    name: "📝 Raison",
                    value: reason
                },
                {
                    name: "👮 Modérateur",
                    value:
                    `${interaction.user}`
                }
            )
            .setTimestamp();

        return interaction.reply({
            embeds: [embed]
        });

    }
};
