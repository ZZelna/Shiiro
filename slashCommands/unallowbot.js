const {
    SlashCommandBuilder,
    PermissionFlagsBits
} = require("discord.js");

const AllowedBot = require("../models/AllowedBot");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("unallowbot")
        .setDescription("Retire un bot de la liste blanche.")
        .addUserOption(option =>
            option
                .setName("bot")
                .setDescription("Le bot")
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {

        const bot = interaction.options.getUser("bot");

        const exists = await AllowedBot.findOne({
            botId: bot.id
        });

        if (!exists) {
            return interaction.reply({
                content: "❌ Ce bot n'est pas autorisé.",
                ephemeral: true
            });
        }

        await AllowedBot.deleteOne({
            botId: bot.id
        });

        interaction.reply({
            content: `✅ **${bot.tag}** a été retiré de la liste blanche.`
        });

    }
};
