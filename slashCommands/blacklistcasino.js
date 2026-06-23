const {
    SlashCommandBuilder
} = require("discord.js");

const CasinoBlacklist = require("../models/CasinoBlacklist");

const allowedRole = "1506674274826584284";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("blacklistcasino")
        .setDescription("Bannir un utilisateur du casino")
        .addUserOption(option =>
            option
                .setName("utilisateur")
                .setDescription("Utilisateur à blacklist")
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName("raison")
                .setDescription("Raison du blacklist")
                .setRequired(false)
        ),

    async execute(interaction) {

        if (
            !interaction.member.roles.cache.has(
                allowedRole
            )
        ) {
            return interaction.reply({
                content:
                    "❌ Vous n'avez pas la permission.",
                ephemeral: true
            });
        }

        const user =
            interaction.options.getUser(
                "utilisateur"
            );

        const reason =
            interaction.options.getString(
                "raison"
            ) || "Aucune raison";

        const already =
            await CasinoBlacklist.findOne({
                userId: user.id
            });

        if (already) {
            return interaction.reply({
                content:
                    "❌ Cet utilisateur est déjà blacklist.",
                ephemeral: true
            });
        }

        await CasinoBlacklist.create({
            userId: user.id,
            reason,
            moderatorId: interaction.user.id
        });

        interaction.reply({
            content:
                `✅ ${user} a été blacklist du casino.\nRaison : **${reason}**`
        });
    }
};
