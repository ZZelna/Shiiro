const {
SlashCommandBuilder,
EmbedBuilder
} = require("discord.js");

const allowedRoles = [
"1506674274826584284",
"1507082580414173234",
"1521596407968960613"
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

       const logChannel = interaction.client.channels.cache.get(
    "1520116351904120852" // ← logs-ban dans Shiiro logs
);

if (logChannel) {

    await logChannel.send({
        content:
`\`\`\`diff
- Débannissement effectué.
Utilisateur: ${userId}
Modérateur: ${interaction.user.tag} (ID: ${interaction.user.id})
Action: Utilisateur débanni. 🔓
\`\`\``
    });

}

await interaction.reply({
    content:
`\`\`\`diff
- Débannissement effectué.
Utilisateur: ${userId}
Modérateur: ${interaction.user.tag} (ID: ${interaction.user.id})
Action: Utilisateur débanni. 🔓
\`\`\``
});

    } catch (err) {

        return interaction.reply({
            content: "❌ Impossible de débannir cet utilisateur.\nVérifiez que l'ID est correct et que la personne est bannie.",
            ephemeral: true
        });

    }
}
};
