const {
    SlashCommandBuilder
} = require("discord.js");

const SavedRoles =
require("../models/SavedRoles");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("rerank")
        .setDescription(
            "Remet les anciens rôles d'un membre"
        )
        .addUserOption(option =>
            option
                .setName("membre")
                .setDescription(
                    "Membre à rerank"
                )
                .setRequired(true)
        ),

    async execute(interaction) {

        if (
            interaction.user.id !==
            "1418370654251778168"
        ) {

            return interaction.reply({
                content:
                "❌ Seul le propriétaire du bot peut utiliser cette commande.",
                ephemeral: true
            });

        }

        const member =
            interaction.options.getMember(
                "membre"
            );

        if (!member) {

            return interaction.reply({
                content:
                "❌ Membre introuvable.",
                ephemeral: true
            });

        }

        const saved =
            await SavedRoles.findOne({
                userId: member.id
            });

        if (
            !saved ||
            !saved.roles ||
            !saved.roles.length
        ) {

            return interaction.reply({
                content:
                "❌ Aucun rôle sauvegardé pour cet utilisateur.",
                ephemeral: true
            });

        }

        try {

            await member.roles.add(
                saved.roles
            );

            await interaction.reply({
                content:
`\`\`\`diff
+ Rerank effectué.
Utilisateur: ${member.user.tag} (ID: ${member.id})
Modérateur: ${interaction.user.tag} (ID: ${interaction.user.id})
Action: Les rôles sauvegardés ont été restaurés. ✅
\`\`\``
            });

        } catch (err) {

            console.error(err);

            return interaction.reply({
                content:
                "❌ Impossible de restaurer les rôles.",
                ephemeral: true
            });

        }

    }
};
