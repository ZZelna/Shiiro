const {
    SlashCommandBuilder
} = require("discord.js");

const GlobalBlacklist =
require("../models/GlobalBlacklist");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("unbl")
        .setDescription(
            "Retirer un utilisateur de la blacklist globale"
        )
        .addUserOption(option =>
            option
                .setName("joueur")
                .setDescription(
                    "Utilisateur à retirer de la BL"
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

        const blacklisted =
        await GlobalBlacklist.findOne({
            userId: target.id
        });

        if (!blacklisted) {

            return interaction.reply({
                content:
                "❌ Cet utilisateur n'est pas blacklisté globalement.",
                ephemeral: true
            });

        }

        await GlobalBlacklist.deleteOne({
            userId: target.id
        });

        return interaction.reply({
            content:
`\`\`\`diff
- Blacklist Globale retirée.
Utilisateur: ${target.tag} (ID: ${target.id})
Modérateur: ${interaction.user.tag} (ID: ${interaction.user.id})
Action: Utilisateur retiré de la blacklist. ✅
\`\`\``
        });

    }
};
