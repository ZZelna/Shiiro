const {
    SlashCommandBuilder,
    PermissionFlagsBits
} = require("discord.js");

const AutoRole = require("../models/AutoRole");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("autorole")
        .setDescription("Configurer le rôle donné automatiquement.")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addRoleOption(option =>
            option
                .setName("role")
                .setDescription("Rôle à attribuer")
                .setRequired(true)
        ),

    async execute(interaction) {

        const role = interaction.options.getRole("role");

        await AutoRole.findOneAndUpdate(
            { guildId: interaction.guild.id },
            {
                guildId: interaction.guild.id,
                roleId: role.id
            },
            { upsert: true }
        );

        await interaction.reply({
            content: `✅ Le rôle ${role} sera maintenant attribué automatiquement aux nouveaux membres.`
        });
    }
};
