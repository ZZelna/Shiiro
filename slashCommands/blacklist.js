const {
    SlashCommandBuilder,
    EmbedBuilder
} = require("discord.js");

const CasinoBlacklist = require("../models/CasinoBlacklist");

const allowedRole = "1506674274826584284";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("blacklist")
        .setDescription(
            "Afficher les utilisateurs blacklistés du casino"
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

        const users =
            await CasinoBlacklist.find();

        if (!users.length) {
            return interaction.reply({
                content:
                    "✅ Aucun utilisateur blacklist.",
                ephemeral: true
            });
        }

        const embed =
            new EmbedBuilder()
                .setColor("Red")
                .setTitle(
                    "🚫 Liste des blacklist casino"
                );

        users.forEach(user => {

            embed.addFields({
                name: user.userId,
                value:
                    `👤 <@${user.userId}>\n📝 ${user.reason}`,
                inline: false
            });

        });

        interaction.reply({
            embeds: [embed]
        });
    }
};
