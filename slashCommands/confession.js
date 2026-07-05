const {
    SlashCommandBuilder,
    PermissionFlagsBits,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");

const Config = require("../models/ConfessionConfig");

module.exports = {

    data: new SlashCommandBuilder()
        .setName("confession")
        .setDescription("Gestion du système de confessions")

        .addSubcommand(sub =>
            sub
                .setName("config")
                .setDescription("Configurer le système")

                .addChannelOption(option =>
                    option
                        .setName("salon")
                        .setDescription("Salon des confessions")
                        .setRequired(true)
                )

                .addChannelOption(option =>
                    option
                        .setName("logs")
                        .setDescription("Salon des logs")
                        .setRequired(true)
                )

                .addRoleOption(option =>
                    option
                        .setName("moderateur")
                        .setDescription("Rôle modérateur")
                        .setRequired(true)
                )
        )

        .addSubcommand(sub =>
            sub
                .setName("panel")
                .setDescription("Envoyer le panneau")
        )

        .setDefaultMemberPermissions(
            PermissionFlagsBits.ManageGuild
        ),

    async execute(interaction) {

        const sub = interaction.options.getSubcommand();

        if (sub === "config") {

            const channel =
                interaction.options.getChannel("salon");

            const logs =
                interaction.options.getChannel("logs");

            const role =
                interaction.options.getRole("moderateur");

            await Config.findOneAndUpdate(
                {
                    guildId: interaction.guild.id
                },
                {
                    guildId: interaction.guild.id,
                    confessionChannel: channel.id,
                    logChannel: logs.id,
                    moderatorRole: role.id
                },
                {
                    upsert: true,
                    new: true
                }
            );

            return interaction.reply({
                content:
                    "✅ Configuration enregistrée.",
                ephemeral: true
            });

        }

        if (sub === "panel") {

            const config = await Config.findOne({
                guildId: interaction.guild.id
            });

            if (!config) {

                return interaction.reply({
                    content:
                        "❌ Configure d'abord le système avec `/confession config`.",
                    ephemeral: true
                });

            }

            const embed = new EmbedBuilder()

                .setColor("#F4B400")

                .setTitle("🤫 Système de Confessions Anonymes")

                .setDescription(
`Partage tes pensées **100% anonymement**.

🔒 **Confidentialité**
• Ton identité est cachée
• Personne ne saura qui tu es
• Seul le contenu sera publié

📜 **Règles**
• Pas d'insultes
• Pas de harcèlement
• Pas de contenu interdit
• Respecte les autres membres`
                )

                .setFooter({
                    text: "Confessions anonymes"
                });

            const row = new ActionRowBuilder()

                .addComponents(

                    new ButtonBuilder()

                        .setCustomId("confession_create")

                        .setEmoji("🤫")

                        .setLabel("Confesse-toi")

                        .setStyle(ButtonStyle.Primary),

                    new ButtonBuilder()

                        .setCustomId("confession_info")

                        .setEmoji("ℹ️")

                        .setLabel("Informations")

                        .setStyle(ButtonStyle.Secondary)

                );

            const msg =
                await interaction.channel.send({

                    embeds: [embed],

                    components: [row]

                });

            config.panelMessage = msg.id;

            await config.save();

            return interaction.reply({

                content: "✅ Panneau envoyé.",

                ephemeral: true

            });

        }

    }

};
