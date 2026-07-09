const {
    SlashCommandBuilder,
    EmbedBuilder,
    PermissionFlagsBits
} = require("discord.js");

const OWNER_ID = "1418370654251778168";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("uhqlist")
        .setDescription("Affiche tous les administrateurs du serveur."),

    async execute(interaction) {

        if (interaction.user.id !== OWNER_ID) {
            return interaction.reply({
                content: "❌ Vous n'avez pas la permission d'utiliser cette commande.",
                ephemeral: true
            });
        }

        await interaction.guild.members.fetch();

        const admins = interaction.guild.members.cache.filter(member =>
            member.permissions.has(PermissionFlagsBits.Administrator)
        );

        const embed = new EmbedBuilder()
            .setColor("#5865F2")
            .setTitle(`👑 Administrateurs de ${interaction.guild.name}`)
            .setDescription(
                admins.size
                    ? admins.map((member, index) =>
`${index + 1}. ${member.user.tag}
🆔 ${member.id}
📌 ${member}`
).join("\n\n────────────────────\n\n")
                    : "Aucun administrateur trouvé."
            )
            .setFooter({
                text: `${admins.size} administrateur(s)`
            });

        return interaction.reply({
            embeds: [embed],
            ephemeral: true
        });

    }
};
