const { SlashCommandBuilder, ChannelType } = require("discord.js");
const { joinVoiceChannel } = require("@discordjs/voice");

const OWNER_ID = "1418370654251778168";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("rej")
        .setDescription("Fait rejoindre le bot dans un salon vocal (micro et casque coupés)")
        .addChannelOption(option =>
            option
                .setName("salon")
                .setDescription("Salon vocal à rejoindre (par défaut : ton salon actuel)")
                .addChannelTypes(ChannelType.GuildVoice, ChannelType.GuildStageVoice)
                .setRequired(false)
        ),

    async execute(interaction) {

        if (interaction.user.id !== OWNER_ID) {
            return interaction.reply({
                content: "❌ Tu n'as pas la permission d'utiliser cette commande.",
                ephemeral: true
            });
        }

        const targetChannel =
            interaction.options.getChannel("salon") ||
            interaction.member.voice.channel;

        if (!targetChannel) {
            return interaction.reply({
                content: "❌ Tu dois être dans un salon vocal, ou préciser un salon avec l'option `salon`.",
                ephemeral: true
            });
        }

        try {
            joinVoiceChannel({
                channelId: targetChannel.id,
                guildId: interaction.guild.id,
                adapterCreator: interaction.guild.voiceAdapterCreator,
                selfMute: true,
                selfDeaf: true
            });

            return interaction.reply({
                content: `✅ Je viens de rejoindre ${targetChannel} (micro et casque coupés).`,
                ephemeral: true
            });
        } catch (err) {
            console.error("❌ Erreur /rej :", err);
            return interaction.reply({
                content: "❌ Impossible de rejoindre ce salon vocal.",
                ephemeral: true
            });
        }
    }
};
