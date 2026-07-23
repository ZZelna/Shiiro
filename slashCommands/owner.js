const {
    SlashCommandBuilder
} = require("discord.js");

const VoiceChannel = require("../models/VoiceChannel");

module.exports = {

    data: new SlashCommandBuilder()
        .setName("owner")
        .setDescription("Transfère la propriété du salon vocal.")
        .addUserOption(option =>
            option
                .setName("utilisateur")
                .setDescription("Nouveau propriétaire")
                .setRequired(true)
        ),

    async execute(interaction) {

        const channel = interaction.member.voice.channel;

        if (!channel) {
            return interaction.reply({
                content: "❌ Vous devez être dans votre salon vocal.",
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

        const target = interaction.options.getMember("utilisateur");

        if (!target) {
            return interaction.reply({
                content: "❌ Cet utilisateur est introuvable.",
                ephemeral: true
            });
        }

        if (target.voice.channelId !== channel.id) {
            return interaction.reply({
                content: "❌ Cette personne doit être dans votre salon vocal.",
                ephemeral: true
            });
        }

        if (target.id === interaction.user.id) {
            return interaction.reply({
                content: "❌ Vous êtes déjà propriétaire.",
                ephemeral: true
            });
        }

        data.ownerId = target.id;
        await data.save();

        await interaction.reply({
            content: `👑 ${target} est désormais le propriétaire du salon vocal.`
        });

    }

};
