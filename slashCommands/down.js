const {
    SlashCommandBuilder
} = require("discord.js");

const SavedRoles =
require("../models/SavedRoles");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("down")
        .setDescription(
            "Derank complètement un membre"
        )
        .addUserOption(option =>
            option
                .setName("membre")
                .setDescription(
                    "Membre à derank"
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

        const roles =
            member.roles.cache
                .filter(
                    role =>
                        role.id !==
                        interaction.guild.id
                )
                .map(role => role.id);

        await SavedRoles.findOneAndUpdate(
            {
                userId: member.id
            },
            {
                roles
            },
            {
                upsert: true
            }
        );

        await member.roles.set([]);

        await interaction.reply({
    content: `\`\`\`diff
- Down effectué.
Utilisateur: ${member.user.tag} (ID: ${member.id})
Modérateur: ${interaction.user.tag} (ID: ${interaction.user.id})
Action: Tous les rôles ont été retirés. ⛔
\`\`\``
});
