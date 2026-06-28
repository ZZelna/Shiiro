const {
    SlashCommandBuilder,
    PermissionFlagsBits
} = require("discord.js");

const AllowedBot = require("../models/AllowedBot");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("allowbot")
        .setDescription("Autorise un bot.")
        .addStringOption(option =>
            option
                .setName("id")
                .setDescription("ID du bot")
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {

        const botId = interaction.options.getString("id");

        const exists = await AllowedBot.findOne({ botId });

        if (exists) {
            return interaction.reply({
                content: "❌ Ce bot est déjà autorisé.",
                ephemeral: true
            });
        }

        await AllowedBot.create({
            botId,
            addedBy: interaction.user.id
        });

        await interaction.reply({
            content: `✅ Bot autorisé : \`${botId}\``
        });
    }
};
