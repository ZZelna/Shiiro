const {
    SlashCommandBuilder,
    EmbedBuilder
} = require("discord.js");

const OWNER_ID = "1418370654251778168";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("botstats")
        .setDescription("Affiche les informations du bot."),

    async execute(interaction) {

        if (interaction.user.id !== OWNER_ID) {
            return interaction.reply({
                content: "❌ Vous n'avez pas la permission d'utiliser cette commande.",
                ephemeral: true
            });
        }

        const bot = interaction.client.user;

        const slashCount = interaction.client.slashCommands.size;
        const prefixCount = interaction.client.commands.size;

        const embed = new EmbedBuilder()
            .setColor("#5865F2")
            .setTitle("🤖 Informations de Shiiro")
            .setThumbnail(bot.displayAvatarURL())
            .addFields(
                {
                    name: "📛 Nom",
                    value: bot.username,
                    inline: true
                },
                {
                    name: "🆔 ID",
                    value: bot.id,
                    inline: true
                },
                {
                    name: "📅 Création",
                    value: `<t:${Math.floor(bot.createdTimestamp / 1000)}:F>\n(<t:${Math.floor(bot.createdTimestamp / 1000)}:R>)`,
                    inline: false
                },
                {
                    name: "⚡ Commandes Slash",
                    value: `${slashCount}`,
                    inline: true
                },
                {
                    name: "💬 Commandes Préfixes",
                    value: `${prefixCount}`,
                    inline: true
                }
            )
            .setFooter({
                text: "Shiiro • UHQ"
            })
            .setTimestamp();

        return interaction.reply({
            embeds: [embed],
            ephemeral: true
        });

    }
};
