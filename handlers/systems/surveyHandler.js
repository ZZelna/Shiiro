const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const Survey = require("../../models/Survey");

module.exports = async function handleSurveyInteraction(interaction) {

    if (!interaction.isButton() || !interaction.customId.startsWith("survey_vote_")) return;

    const survey = await Survey.findOne({ messageId: interaction.message.id });

    if (!survey) {
        return interaction.reply({ content: "❌ Sondage introuvable.", ephemeral: true });
    }

    if (survey.ended) {
        return interaction.reply({ content: "❌ Ce sondage est terminé.", ephemeral: true });
    }

    const index = Number(interaction.customId.replace("survey_vote_", ""));

    if (!survey.choices[index]) {
        return interaction.reply({ content: "❌ Choix invalide.", ephemeral: true });
    }

    const alreadyVoted = survey.choices[index].votes.includes(interaction.user.id);

    if (alreadyVoted) {
        return interaction.reply({ content: "❌ Tu votes déjà pour cette option.", ephemeral: true });
    }

    // Retire l'ancien vote
    survey.choices.forEach(choice => {
        choice.votes = choice.votes.filter(id => id !== interaction.user.id);
    });

    // Ajoute le nouveau
    survey.choices[index].votes.push(interaction.user.id);

    survey.totalVotes = survey.choices.reduce((a, b) => a + b.votes.length, 0);

    await survey.save();

    const embed = new EmbedBuilder()
        .setColor("#5865F2")
        .setTitle("📊 Nouveau sondage")
        .setDescription(survey.question)
        .setFooter({ text: survey.anonymous ? "🔒 Sondage anonyme" : "👥 Votes publics" });

    survey.choices.forEach((choice, i) => {

        const votes = choice.votes.length;
        const percent = survey.totalVotes === 0 ? 0 : Math.round((votes / survey.totalVotes) * 100);
        const bars = "█".repeat(Math.round(percent / 10)) + "░".repeat(10 - Math.round(percent / 10));

        let value = `${bars} **${percent}%** (${votes})`;

        if (!survey.anonymous && choice.votes.length) {
            value += `\n${choice.votes.map(id => `<@${id}>`).join(", ")}`;
        }

        embed.addFields({ name: `${i + 1}. ${choice.label}`, value });
    });

    embed.addFields({ name: "👥 Total", value: `${survey.totalVotes} vote(s)` });
    embed.addFields({ name: "⏳ Fin", value: `<t:${Math.floor(survey.endAt / 1000)}:R>` });

    const row = new ActionRowBuilder();

    survey.choices.forEach((choice, i) => {
        row.addComponents(
            new ButtonBuilder()
                .setCustomId(`survey_vote_${i}`)
                .setLabel(choice.label)
                .setStyle(ButtonStyle.Primary)
        );
    });

    await interaction.update({ embeds: [embed], components: [row] });
};
