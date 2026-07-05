const {
    SlashCommandBuilder,
    PermissionFlagsBits,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");

const Survey = require("../models/Survey");

module.exports = {

    data: new SlashCommandBuilder()
        .setName("survey")
        .setDescription("Gestion des sondages")

        // CREATE
        .addSubcommand(sub =>
            sub
                .setName("create")
                .setDescription("Créer un sondage")

                .addStringOption(option =>
                    option
                        .setName("question")
                        .setDescription("Question")
                        .setRequired(true)
                )

                .addStringOption(option =>
                    option
                        .setName("choix1")
                        .setDescription("Premier choix")
                        .setRequired(true)
                )

                .addStringOption(option =>
                    option
                        .setName("choix2")
                        .setDescription("Deuxième choix")
                        .setRequired(true)
                )

                .addStringOption(option =>
                    option
                        .setName("choix3")
                        .setDescription("Troisième choix")
                        .setRequired(false)
                )

                .addStringOption(option =>
                    option
                        .setName("choix4")
                        .setDescription("Quatrième choix")
                        .setRequired(false)
                )

                .addStringOption(option =>
                    option
                        .setName("choix5")
                        .setDescription("Cinquième choix")
                        .setRequired(false)
                )

                .addStringOption(option =>
                    option
                        .setName("duree")
                        .setDescription("Ex: 10m, 1h, 2d")
                        .setRequired(true)
                )

                .addBooleanOption(option =>
                    option
                        .setName("anonyme")
                        .setDescription("Sondage anonyme ?")
                        .setRequired(false)
                )
        )

        // END
        .addSubcommand(sub =>
            sub
                .setName("end")
                .setDescription("Terminer un sondage")
                .addStringOption(option =>
                    option
                        .setName("messageid")
                        .setDescription("ID du message")
                        .setRequired(true)
                )
        )

        // RESULTS
        .addSubcommand(sub =>
            sub
                .setName("results")
                .setDescription("Afficher les résultats")
                .addStringOption(option =>
                    option
                        .setName("messageid")
                        .setDescription("ID du message")
                        .setRequired(true)
                )
        )

        // DELETE
        .addSubcommand(sub =>
            sub
                .setName("delete")
                .setDescription("Supprimer un sondage")
                .addStringOption(option =>
                    option
                        .setName("messageid")
                        .setDescription("ID du message")
                        .setRequired(true)
                )
        )

        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

    async execute(interaction) {

        const sub = interaction.options.getSubcommand();

       if (sub === "create") {

    const question = interaction.options.getString("question");
    const duration = interaction.options.getString("duree");
    const anonymous = interaction.options.getBoolean("anonyme") ?? false;

    const choices = [];

    for (let i = 1; i <= 5; i++) {
        const choice = interaction.options.getString(`choix${i}`);
        if (choice) {
            choices.push({
                label: choice,
                votes: []
            });
        }
    }

    const match = duration.match(/^(\d+)(m|h|d)$/);

    if (!match) {
        return interaction.reply({
            content: "❌ Format de durée invalide. Exemple : `10m`, `2h`, `1d`",
            ephemeral: true
        });
    }

    let ms = Number(match[1]);

    if (match[2] === "m") ms *= 60000;
    if (match[2] === "h") ms *= 3600000;
    if (match[2] === "d") ms *= 86400000;

    const endAt = Date.now() + ms;

    const embed = new EmbedBuilder()
        .setColor("#5865F2")
        .setTitle("📊 Nouveau sondage")
        .setDescription(question)
        .setFooter({
            text: anonymous
                ? "🔒 Sondage anonyme"
                : "👥 Votes publics"
        })
        .setTimestamp(new Date(endAt));

    choices.forEach((choice, index) => {
        embed.addFields({
            name: `${index + 1}. ${choice.label}`,
            value: "░░░░░░░░░░ 0% (0 vote)",
            inline: false
        });
    });

    embed.addFields({
        name: "👥 Total",
        value: "0 vote",
        inline: false
    });

    embed.addFields({
        name: "⏳ Fin",
        value: `<t:${Math.floor(endAt / 1000)}:R>`,
        inline: false
    });

    const row = new ActionRowBuilder();

    choices.forEach((choice, index) => {
        row.addComponents(
            new ButtonBuilder()
                .setCustomId(`survey_vote_${index}`)
                .setLabel(choice.label)
                .setStyle(ButtonStyle.Primary)
        );
    });

    const msg = await interaction.channel.send({
        embeds: [embed],
        components: [row]
    });

    await Survey.create({
        guildId: interaction.guild.id,
        channelId: interaction.channel.id,
        messageId: msg.id,
        authorId: interaction.user.id,
        question,
        choices,
        anonymous,
        endAt
    });

    await interaction.reply({
        content: "✅ Sondage créé.",
        ephemeral: true
    });

}

        if (sub === "end") {

            // Fin manuelle

        }

        if (sub === "results") {

            // Affichage des résultats

        }

        if (sub === "delete") {

            // Suppression

        }

    }

};
