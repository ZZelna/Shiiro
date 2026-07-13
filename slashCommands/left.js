const { SlashCommandBuilder } = require("discord.js");
const { getVoiceConnection } = require("@discordjs/voice");

const OWNER_ID = "1418370654251778168";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("left")
        .setDescription("Fait quitter le bot du salon vocal"),

    async execute(interaction) {

        if (interaction.user.id !== OWNER_ID) {
            return interaction.reply({
                content: "❌ Tu n'as pas la permission d'utiliser cette commande.",
                ephemeral: true
            });
        }

        const connection = getVoiceConnection(interaction.guild.id);

        if (!connection) {
            return interaction.reply({
                content: "❌ Je ne suis connecté à aucun salon vocal sur ce serveur.",
                ephemeral: true
            });
        }

        connection.destroy();

        return interaction.reply({
            content: "✅ Je viens de quitter le salon vocal.",
            ephemeral: true
        });
    }
};
