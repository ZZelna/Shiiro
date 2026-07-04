const { SlashCommandBuilder } = require("discord.js");

module.exports = {

    data: new SlashCommandBuilder()

        .setName("games")

        .setDescription("Lance un mini-jeu sans récompense.")

        .addStringOption(option =>
            option
                .setName("jeu")
                .setDescription("Choisissez un mini-jeu")
                .setRequired(true)

                .addChoices(

    {
        name: "🌸 Guess Anime",
        value: "guessanime"
    },

    {
        name: "🎬 Guess Film",
        value: "guessfilms"
    },

    {
        name: "🎵 Guess Musique",
        value: "guessmusique"
    },

    {
        name: "💿 Guess Album",
        value: "guessalbum"
    },

    {
        name: "🎤 Guess Artiste",
        value: "guessartiste"
    },

    {
        name: "🏷️ Guess Brand",
        value: "guessbrand"
    },

    {
        name: "🎨 Guess Couleur",
        value: "guesscouleur"
    },

    {
        name: "🏙️ Guess Citation",
        value: "guesscita"
    },

    {
        name: "🌍 Guess Country",
        value: "guesscountry"
    },

    {
        name: "🏛️ Guess Capitale",
        value: "guesscapitale"
    },

    {
        name: "🚩 Guess Flags",
        value: "guessflags"
    }

)
        ),

    async execute(interaction) {

        const gameName =
            interaction.options.getString("jeu");

        const game =
            interaction.client.commands.get(gameName);

        if (!game) {

            return interaction.reply({
                content: "❌ Mini-jeu introuvable.",
                ephemeral: true
            });

        }

        await interaction.reply({
            content: "🎮 Lancement du mini-jeu...\n*Aucune récompense ne sera donnée.*"
        });

        const fakeMessage = {

            channel: interaction.channel,

            guild: interaction.guild,

            author: interaction.user,

            member: interaction.member,

            reply: (data) => interaction.followUp(data)

        };

        await game.run(
            fakeMessage,
            [],
            {
                reward: false,
                fromGames: true
            }
        );

    }

};
