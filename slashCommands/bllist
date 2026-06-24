const {
    SlashCommandBuilder,
    EmbedBuilder
} = require("discord.js");

const GlobalBlacklist =
require("../models/GlobalBlacklist");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("bllist")
        .setDescription(
            "Afficher la blacklist globale"
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

        const users =
        await GlobalBlacklist.find()
        .sort({
            createdAt: -1
        });

        if (!users.length) {

            return interaction.reply({
                content:
                "✅ Aucun utilisateur dans la blacklist globale.",
                ephemeral: true
            });

        }

        let description = "";

        for (const entry of users) {

            const user =
            await interaction.client.users
            .fetch(entry.userId)
            .catch(() => null);

            const moderator =
            await interaction.client.users
            .fetch(entry.moderatorId)
            .catch(() => null);

            description +=
            "```diff\n" +
            `- Blacklist Globale\n` +
            `Utilisateur: ${
                user
                    ? user.tag
                    : "Utilisateur inconnu"
            } (ID: ${entry.userId})\n` +
            `Raison: ${entry.reason}\n` +
            `Modérateur: ${
                moderator
                    ? moderator.tag
                    : "Inconnu"
            } (ID: ${entry.moderatorId})\n` +
            `Date: ${entry.createdAt.toLocaleDateString("fr-FR")}\n` +
            "```\n";
        }

        const embed =
        new EmbedBuilder()
            .setColor("Red")
            .setTitle(
                "⛔ Blacklist Globale"
            )
            .setDescription(
                description
            )
            .setFooter({
                text:
                `${users.length} utilisateur(s) blacklisté(s)`
            })
            .setTimestamp();

        return interaction.reply({
            embeds: [embed],
            ephemeral: true
        });

    }
};
