const {
    SlashCommandBuilder
} = require("discord.js");

const allowedRoles = [
    "1506674274826584284",
    "1506709088451690708"
];

const casinoRoleId =
    "1507055410211848213";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("pingcasino")
        .setDescription(
            "Ping le rôle casino"
        ),

    async execute(interaction) {

        const hasPermission =
            interaction.member.roles.cache.some(
                role =>
                    allowedRoles.includes(
                        role.id
                    )
            );

        if (!hasPermission) {
            return interaction.reply({
                content:
                    "❌ Vous n'avez pas la permission.",
                ephemeral: true
            });
        }

        await interaction.channel.send({
            content: `<@&${casinoRoleId}>`
        });

        await interaction.reply({
            content:
                "✅ Ping envoyé.",
            ephemeral: true
        });
    }
};
