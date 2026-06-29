const {
    SlashCommandBuilder
} = require("discord.js");
module.exports = {
    data: new SlashCommandBuilder()
        .setName("rolemembers")
        .setDescription("Affiche les membres possédant un rôle.")
        .addRoleOption(option =>
            option
                .setName("role")
                .setDescription("Le rôle à vérifier")
                .setRequired(true)
        ),
    async execute(interaction) {
        const role =
            interaction.options.getRole("role");
        const members =
            [...role.members.values()];
        if (members.length === 0) {
            return interaction.reply({
                content:
`\\\`\\\`\\\`diff
- Informations du rôle.
Rôle: ${role.name} (ID: ${role.id})
Nombre de membres: 0
Membres:
Aucun membre.
Action: Liste récupérée.
Demandé par: ${interaction.user.tag} (ID: ${
