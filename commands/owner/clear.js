const {
    SlashCommandBuilder,
    PermissionFlagsBits
} = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("clear")
        .setDescription("Supprime des messages")
        .addIntegerOption(option =>
            option
                .setName("amount")
                .setDescription("Nombre de messages à supprimer (1-100)")
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(100)
        )
        .addUserOption(option =>
            option
                .setName("user")
                .setDescription("Supprimer uniquement les messages d'un utilisateur")
                .setRequired(false)
        )
        .addStringOption(option =>
            option
                .setName("reason")
                .setDescription("Raison de la suppression")
                .setRequired(false)
        ),

    async execute(interaction) {

        const allowedRoles = [
            "1506674274826584284",
            "1521596407968960613"
        ];

        if (!interaction.member.roles.cache.some(role => allowedRoles.includes(role.id))) {
            return interaction.reply({
                content: "❌ Vous n'avez pas la permission.",
                ephemeral: true
            });
        }

        const amount = interaction.options.getInteger("amount");
        const user = interaction.options.getUser("user");

        const messages = await interaction.channel.messages.fetch({
            limit: 100
        });

        let filtered = messages;

        if (user) {
            filtered = messages.filter(msg => msg.author.id === user.id);
        }

        filtered = filtered.first(amount);

        await interaction.channel.bulkDelete(filtered, true);

        await interaction.reply({
            content: `✅ ${filtered.length} messages supprimés${user ? ` de ${user}` : ""}.`,
            ephemeral: true
        });
    }
};
