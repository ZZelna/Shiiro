const {
    SlashCommandBuilder,
    PermissionFlagsBits
} = require("discord.js");

const VoiceChannel = require("../models/VoiceChannel");

module.exports = {

    data: new SlashCommandBuilder()
        .setName("lock")
        .setDescription("Verrouille ou déverrouille votre salon vocal.")
        .addStringOption(option =>
            option
                .setName("etat")
                .setDescription("Choisissez l'action")
                .setRequired(true)
                .addChoices(
                    { name: "🔒 Verrouiller", value: "lock" },
                    { name: "🔓 Déverrouiller", value: "unlock" }
                )
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
                content: "❌ Vous n'êtes pas propriétaire de ce salon.",
                ephemeral: true
            });
        }

        const state = interaction.options.getString("etat");

        if (state === "lock") {

            await channel.permissionOverwrites.edit(channel.guild.id, {
                Connect: false
            });

            return interaction.reply({
                content: "🔒 Votre salon est maintenant verrouillé."
            });

        }

        await channel.permissionOverwrites.edit(channel.guild.id, {
            Connect: null
        });

        return interaction.reply({
            content: "🔓 Votre salon est maintenant déverrouillé."
        });

    }

};
