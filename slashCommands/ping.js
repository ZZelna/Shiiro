const { SlashCommandBuilder } = require("discord.js");

module.exports = {

    data: new SlashCommandBuilder()

        .setName("ping")

        .setDescription("Mentionne un rôle.")

        .addRoleOption(option =>
            option
                .setName("role")
                .setDescription("Le rôle à mentionner")
                .setRequired(true)
        ),

    async execute(interaction) {

        const allowedRoles = [
            "1506674274826584284",
            "1506678694352261301",
            "1506678765982318743"
        ];

        const hasPermission = interaction.member.roles.cache.some(role =>
            allowedRoles.includes(role.id)
        );

        if (!hasPermission) {
            return interaction.reply({
                content: "❌ Vous n'avez pas la permission d'utiliser cette commande.",
                ephemeral: true
            });
        }

        const role = interaction.options.getRole("role");

        await interaction.reply({
            content: `<@&${role.id}>`,
            allowedMentions: {
                roles: [role.id]
            }
        });

    }

};
