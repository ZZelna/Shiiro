const {
SlashCommandBuilder,
EmbedBuilder
} = require("discord.js");

const allowedRoles = [
"1506674274826584284",
"1507082580414173234"
];

module.exports = {
data: new SlashCommandBuilder()
.setName("unban")
.setDescription("Débannir un utilisateur")
.addStringOption(option =>
option
.setName("id")
.setDescription("ID de l’utilisateur à débannir")
.setRequired(true)
),
async execute(interaction) {

    const hasPermission =
        interaction.member.roles.cache.some(role =>
            allowedRoles.includes(role.id)
        );

    if (!hasPermission) {
        return interaction.reply({
            content: "❌ Vous n'avez pas la permission d'utiliser cette commande.",
            ephemeral: true
        });
    }

    const userId =
        interaction.options.getString("id");

    try {

        await interaction.guild.members.unban(
            userId,
            `Unban par ${interaction.user.tag}`
        );

        const embed = new EmbedBuilder()
            .setColor("#57F287")
            .setTitle("🔓 Débannissement effectué")
            .addFields(
                {
                    name: "👤 ID Utilisateur",
                    value: userId,
                    inline: true
                },
                {
                    name: "🛡️ Juge",
                    value: interaction.user.tag,
                    inline: true
                }
            )
            .setTimestamp();

        await interaction.reply({
            embeds: [embed]
        });

    } catch (err) {

        return interaction.reply({
            content: "❌ Impossible de débannir cet utilisateur.\nVérifiez que l'ID est correct et que la personne est bannie.",
            ephemeral: true
        });

    }
}
};
