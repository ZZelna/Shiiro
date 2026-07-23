const {
    SlashCommandBuilder,
    PermissionFlagsBits
} = require("discord.js");

const VoiceChannel = require("../models/VoiceChannel");

module.exports = {

    data: new SlashCommandBuilder()
        .setName("privacy")
        .setDescription("Change la confidentialité de votre salon.")
        .addStringOption(option =>
            option
                .setName("etat")
                .setDescription("Confidentialité")
                .setRequired(true)
                .addChoices(
                    {
                        name: "🌍 Public",
                        value: "public"
                    },
                    {
                        name: "🔒 Privé",
                        value: "private"
                    }
                )
        ),

    async execute(interaction) {

        const channel = interaction.member.voice.channel;

        if (!channel)
            return interaction.reply({
                content: "❌ Vous devez être dans votre salon.",
                ephemeral: true
            });

        const data = await VoiceChannel.findOne({
            channelId: channel.id
        });

        if (!data)
            return interaction.reply({
                content: "❌ Ce salon n'est pas temporaire.",
                ephemeral: true
            });

        if (data.ownerId !== interaction.user.id)
            return interaction.reply({
                content: "❌ Vous n'êtes pas propriétaire.",
                ephemeral: true
            });

        const state = interaction.options.getString("etat");

        if (state === "private") {

            await channel.permissionOverwrites.edit(channel.guild.id, {
                ViewChannel: false,
                Connect: false
            });

            return interaction.reply({
                content: "🔒 Votre salon est maintenant privé."
            });

        }

        await channel.permissionOverwrites.edit(channel.guild.id, {
            ViewChannel: true,
            Connect: true
        });

        return interaction.reply({
            content: "🌍 Votre salon est maintenant public."
        });

    }

};
