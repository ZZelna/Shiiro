const {
    SlashCommandBuilder,
    PermissionFlagsBits
} = require("discord.js");

const ShieldConfig = require("../models/ShieldConfig");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("allowbot")
        .setDescription("Autorise un bot à rejoindre le serveur.")
        .addStringOption(option =>
            option
                .setName("id")
                .setDescription("ID du bot")
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {

        const botId = interaction.options.getString("id");

        let config = await ShieldConfig.findOne({
            guildId: interaction.guild.id
        });

        if (!config) {
            config = await ShieldConfig.create({
                guildId: interaction.guild.id,
                allowedBots: []
            });
        }

        if (!config.allowedBots)
            config.allowedBots = [];

        if (config.allowedBots.includes(botId)) {
            return interaction.reply({
                content: "❌ Ce bot est déjà autorisé.",
                ephemeral: true
            });
        }

        config.allowedBots.push(botId);
        await config.save();

        interaction.reply({
            content: `✅ Bot autorisé : \`${botId}\``
        });

    }
};
