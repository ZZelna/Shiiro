const {
    SlashCommandBuilder,
    EmbedBuilder
} = require("discord.js");

const OWNER_ID = "1418370654251778168";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("botstats")
        .setDescription("Affiche les statistiques des commandes du bot."),

    async execute(interaction) {

        if (interaction.user.id !== OWNER_ID) {
            return interaction.reply({
                content: "❌ Vous n'avez pas la permission d'utiliser cette commande.",
                ephemeral: true
            });
        }

        const slashCommands = interaction.client.slashCommands.size;
        const prefixCommands = interaction.client.commands.size;

        const embed = new EmbedBuilder()
            .setColor("#5865F2")
            .setTitle("📊 Statistiques du bot")
            .addFields(
                {
                    name: "⚡ Commandes Slash",
                    value: `${slashCommands}`,
                    inline: true
                },
                {
                    name: "💬 Commandes Préfixées",
                    value: `${prefixCommands}`,
                    inline: true
                },
                {
                    name: "📦 Total",
                    value: `${slashCommands + prefixCommands}`,
                    inline: true
                }
            )
            .setFooter({
                text: interaction.client.user.username
            })
            .setTimestamp();

        return interaction.reply({
            embeds: [embed],
            ephemeral: true
        });

    }
};
