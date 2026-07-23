const {
    SlashCommandBuilder
} = require("discord.js");

const VoiceChannel = require("../models/VoiceChannel");

module.exports = {

    data: new SlashCommandBuilder()
        .setName("limit")
        .setDescription("Définit la limite de votre salon vocal.")
        .addIntegerOption(option =>
            option
                .setName("nombre")
                .setDescription("Nombre de places (0 à 99)")
                .setRequired(true)
                .setMinValue(0)
                .setMaxValue(99)
        ),

    async execute(interaction) {

        const channel = interaction.member.voice.channel;

        if (!channel) {
            return interaction.reply({
                content: "❌ Vous devez être dans un salon vocal.",
                ephemeral: true
            });
        }

        const data = await VoiceChannel.findOne({
            channelId: channel.id
        });

        if (!data) {
            return interaction.reply({
                content: "❌ Ce salon n'est pas un vocal temporaire.",
                ephemeral: true
            });
        }

        if (data.ownerId !== interaction.user.id) {
            return interaction.reply({
                content: "❌ Vous n'êtes pas le propriétaire de ce salon.",
                ephemeral: true
            });
        }

        const limit = interaction.options.getInteger("nombre");

        await channel.setUserLimit(limit);

        await interaction.reply({
            content: limit === 0
                ? "✅ La limite du salon a été supprimée."
                : `✅ La limite du salon est maintenant de **${limit}** personne(s).`
        });

    }

};
