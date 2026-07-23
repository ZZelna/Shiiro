const {
    SlashCommandBuilder
} = require("discord.js");

const VoiceChannel = require("../models/VoiceChannel");

module.exports = {

    data: new SlashCommandBuilder()
        .setName("permit")
        .setDescription("Gère les accès à votre salon vocal.")
        .addUserOption(option =>
            option
                .setName("utilisateur")
                .setDescription("Utilisateur concerné")
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName("action")
                .setDescription("Action à effectuer")
                .setRequired(true)
                .addChoices(
                    {
                        name: "✅ Autoriser",
                        value: "allow"
                    },
                    {
                        name: "❌ Retirer",
                        value: "remove"
                    }
                )
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
                content: "❌ Vous n'êtes pas propriétaire de ce salon.",
                ephemeral: true
            });
        }

        const target = interaction.options.getMember("utilisateur");

        if (!target) {
            return interaction.reply({
                content: "❌ Utilisateur introuvable.",
                ephemeral: true
            });
        }

        const action = interaction.options.getString("action");

        if (action === "allow") {

            await channel.permissionOverwrites.edit(target.id, {
                Connect: true,
                ViewChannel: true
            });

            return interaction.reply({
                content: `✅ ${target} peut désormais rejoindre votre salon.`
            });

        }

        await channel.permissionOverwrites.delete(target.id);

        return interaction.reply({
            content: `❌ ${target} ne possède plus d'autorisation spéciale.`
        });

    }

};
