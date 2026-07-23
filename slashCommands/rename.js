const {
    SlashCommandBuilder,
    PermissionFlagsBits
} = require("discord.js");

const VoiceChannel = require("../models/VoiceChannel");

module.exports = {

    data: new SlashCommandBuilder()
        .setName("rename")
        .setDescription("Renomme votre salon vocal.")
        .addStringOption(option =>
            option
                .setName("nom")
                .setDescription("Nouveau nom")
                .setRequired(true)
        ),

    async execute(interaction) {

        if (!interaction.member.voice.channel) {

            return interaction.reply({
                content: "❌ Vous devez être dans un salon vocal.",
                ephemeral: true
            });

        }

        const voice = interaction.member.voice.channel;

        const data = await VoiceChannel.findOne({
            channelId: voice.id
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

        const name = interaction.options.getString("nom").trim();

if (name.length < 2) {

    return interaction.reply({
        content: "❌ Le nom doit contenir au moins **2 caractères**.",
        ephemeral: true
    });

}

if (name.length > 32) {

    return interaction.reply({
        content: "❌ Le nom ne peut pas dépasser **32 caractères**.",
        ephemeral: true
    });

}

try {

    await voice.setName(`🎧・${name}`);

    await interaction.reply({
        content: `✅ Votre salon a été renommé en **🎧・${name}**`
    });

} catch (err) {

    console.error(err);

    return interaction.reply({
        content: "❌ Impossible de renommer le salon.",
        ephemeral: true
    });

}

    }

};
