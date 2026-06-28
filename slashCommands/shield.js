const {
    SlashCommandBuilder,
    PermissionFlagsBits,
    EmbedBuilder
} = require("discord.js");

const ShieldConfig = require("../models/ShieldConfig");

module.exports = {

    data: new SlashCommandBuilder()
        .setName("shield")
        .setDescription("Configurer le Shield")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)

        .addSubcommand(sub =>
            sub
                .setName("setup")
                .setDescription("Créer la configuration du Shield")
        )

        .addSubcommand(sub =>
            sub
                .setName("enable")
                .setDescription("Activer le Shield")
        )

        .addSubcommand(sub =>
            sub
                .setName("disable")
                .setDescription("Désactiver le Shield")
        )

        .addSubcommand(sub =>
            sub
                .setName("punishment")
                .setDescription("Changer la sanction")
                .addStringOption(option =>
                    option
                        .setName("type")
                        .setDescription("Sanction")
                        .setRequired(true)
                        .addChoices(
                            { name: "Timeout", value: "timeout" },
                            { name: "Kick", value: "kick" },
                            { name: "Ban", value: "ban" }
                        )
                )
        )

        .addSubcommand(sub =>
            sub
                .setName("timeout")
                .setDescription("Durée du timeout")
                .addIntegerOption(option =>
                    option
                        .setName("secondes")
                        .setDescription("Durée")
                        .setRequired(true)
                )
        ),

    async execute(interaction) {

        let config = await ShieldConfig.findOne({
            guildId: interaction.guild.id
        });

        const sub = interaction.options.getSubcommand();

        if (sub === "setup") {

            if (!config) {
                config = await ShieldConfig.create({
                    guildId: interaction.guild.id
                });
            }

            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor("Green")
                        .setTitle("✅ Shield configuré")
                        .setDescription("La configuration a été créée.")
                ]
            });

        }

        if (!config) {

            config = await ShieldConfig.create({
                guildId: interaction.guild.id
            });

        }

        if (sub === "enable") {

            config.enabled = true;
            await config.save();

            return interaction.reply({
                content: "✅ Shield activé."
            });

        }

        if (sub === "disable") {

            config.enabled = false;
            await config.save();

            return interaction.reply({
                content: "❌ Shield désactivé."
            });

        }

        if (sub === "punishment") {

            config.punishment = interaction.options.getString("type");

            await config.save();

            return interaction.reply({
                content: `✅ Sanction définie sur **${config.punishment}**.`
            });

        }

        if (sub === "timeout") {

            config.timeoutDuration =
                interaction.options.getInteger("secondes");

            await config.save();

            return interaction.reply({
                content: `✅ Timeout réglé à **${config.timeoutDuration} secondes**.`
            });

        }

    }

};
