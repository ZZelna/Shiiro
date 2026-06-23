const {
    SlashCommandBuilder
} = require("discord.js");

const CasinoBlacklist = require("../models/CasinoBlacklist");

const allowedRole = "1506674274826584284";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("unblacklistcasino")
        .setDescription("Retirer un utilisateur de la blacklist casino")
        .addUserOption(option =>
            option
                .setName("utilisateur")
                .setDescription("Utilisateur à débannir")
                .setRequired(true)
        ),

    async execute(interaction) {

        if (
            !interaction.member.roles.cache.has(
                allowedRole
            )
        ) {
            return interaction.reply({
                content: "❌ Vous n'avez pas la permission.",
                ephemeral: true
            });
        }

        const user =
            interaction.options.getUser(
                "utilisateur"
            );

        const blacklist =
            await CasinoBlacklist.findOne({
                userId: user.id
            });

        if (!blacklist) {
            return interaction.reply({
                content:
                    "❌ Cet utilisateur n'est pas blacklist.",
                ephemeral: true
            });
        }

        await CasinoBlacklist.deleteOne({
            userId: user.id
        });

        interaction.reply({
            content:
                `✅ ${user} a été retiré de la blacklist casino.`
        });
    }
};
