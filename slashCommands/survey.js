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

const Survey = require("../models/Survey");

if (sub === "end") {

    const messageId = interaction.options.getString("messageid");

    const survey = await Survey.findOne({
        messageId
    });

    if (!survey || survey.ended) {
        return interaction.reply({
            content: "❌ Sondage introuvable.",
            ephemeral: true
        });
    }

    survey.ended = true;
    await survey.save();

    const channel = await interaction.guild.channels.fetch(survey.channelId);
    const msg = await channel.messages.fetch(survey.messageId);

    let total = 0;

    survey.choices.forEach(c => {
        total += c.votes.length;
    });

    const embed = new EmbedBuilder()
        .setColor("Red")
        .setTitle("📊 Sondage terminé")
        .setDescription(survey.question);

    let winner = null;

    survey.choices.forEach(choice => {

        if (!winner || choice.votes.length > winner.votes.length)
            winner = choice;

        const percent =
            total === 0
                ? 0
                : Math.round(choice.votes.length / total * 100);

        const bar =
            "█".repeat(Math.round(percent / 10)) +
            "░".repeat(10 - Math.round(percent / 10));

        embed.addFields({
            name: choice.label,
            value: `${bar} ${percent}% (${choice.votes.length})`
        });

    });

    embed.addFields({
        name: "🏆 Gagnant",
        value: winner ? winner.label : "Aucun"
    });

    await msg.edit({
        embeds: [embed],
        components: []
    });

    return interaction.reply({
        content: "✅ Sondage terminé.",
        ephemeral: true
    });

}
if (sub === "results") {

    const messageId = interaction.options.getString("messageid");

    const survey = await Survey.findOne({
        messageId
    });

    if (!survey) {
        return interaction.reply({
            content: "❌ Sondage introuvable.",
            ephemeral: true
        });
    }

    let total = 0;

    survey.choices.forEach(c => {
        total += c.votes.length;
    });

    const embed = new EmbedBuilder()
        .setColor("#5865F2")
        .setTitle("📊 Résultats")
        .setDescription(survey.question);

    survey.choices.forEach(choice => {

        const percent =
            total === 0
                ? 0
                : Math.round(choice.votes.length / total * 100);

        const bar =
            "█".repeat(Math.round(percent / 10)) +
            "░".repeat(10 - Math.round(percent / 10));

        embed.addFields({
            name: choice.label,
            value: `${bar} ${percent}% (${choice.votes.length})`
        });

    });

    embed.setFooter({
        text: `${total} vote(s)`
    });

    return interaction.reply({
        embeds: [embed],
        ephemeral: true
    });

}
if (sub === "delete") {

const messageId = interaction.options.getString("messageid");

    const survey = await Survey.findOne({
        messageId
    });

    if (!survey) {
        return interaction.reply({
            content: "❌ Sondage introuvable.",
            ephemeral: true
        });
    }

    try {

        const channel = await interaction.guild.channels.fetch(
            survey.channelId
        );

        const msg = await channel.messages.fetch(
            survey.messageId
        );

        await msg.delete();

    } catch (err) {
        console.log(err);
    }

    await Survey.deleteOne({
        _id: survey._id
    });

    return interaction.reply({
        content: "🗑️ Sondage supprimé.",
        ephemeral: true
    });

}

}
};
