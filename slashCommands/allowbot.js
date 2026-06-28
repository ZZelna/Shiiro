const {
    SlashCommandBuilder,
    PermissionFlagsBits
} = require("discord.js");

const AllowedBot = require("../models/AllowedBot");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("allowbot")
        .setDescription("Autorise un bot à rejoindre le serveur.")
        .addUserOption(option =>
            option
                .setName("bot")
                .setDescription("Le bot à autoriser")
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {

        const bot = interaction.options.getUser("bot");

        if (!bot.bot) {
            return interaction.reply({
                content: "❌ Cet utilisateur n'est pas un bot.",
                ephemeral: true
            });
        }

        const exists = await AllowedBot.findOne({
            botId: bot.id
        });

        if (exists) {
            return interaction.reply({
                content: "❌ Ce bot est déjà autorisé.",
                ephemeral: true
            });
        }

        await AllowedBot.create({
            botId: bot.id,
            addedBy: interaction.user.id
        });

        interaction.reply({
            content: `✅ **${bot.tag}** est maintenant autorisé.`
        });

    }
};
