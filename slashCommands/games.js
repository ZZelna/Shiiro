const {
    SlashCommandBuilder,
    ActionRowBuilder,
    StringSelectMenuBuilder
} = require("discord.js");

module.exports = {

    data: new SlashCommandBuilder()
        .setName("games")
        .setDescription("Lance un mini-jeu sans récompense."),

    async execute(interaction) {

        const menu = new StringSelectMenuBuilder()

            .setCustomId("games_menu")

            .setPlaceholder("Choisissez un mini-jeu")

            .addOptions(

                {
                    label: "Guess Anime",
                    value: "guessanime",
                    emoji: "🌸"
                },

                {
                    label: "Guess Brand",
                    value: "guessbrand",
                    emoji: "🏷️"
                },

                {
                    label: "Guess Couleur",
                    value: "guesscouleur",
                    emoji: "🎨"
                },

                {
                    label: "Guess Cita",
                    value: "guesscita",
                    emoji: "🏙️"
                },

                {
                    label: "Guess Country",
                    value: "guesscountry",
                    emoji: "🌍"
                },

                {
                    label: "Guess Capitale",
                    value: "guesscapitale",
                    emoji: "🏛️"
                },

                {
                    label: "Guess Flags",
                    value: "guessflags",
                    emoji: "🚩"
                }

            );

        const row = new ActionRowBuilder()
            .addComponents(menu);

        await interaction.reply({

            content:
                "🎮 **Choisissez un mini-jeu.**\n*Aucune récompense ne sera donnée.*",

            components: [row]

        });

    }

};
