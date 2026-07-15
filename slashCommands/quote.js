const {
    SlashCommandBuilder,
    AttachmentBuilder
} = require("discord.js");

const QuoteRenderer = require("../handlers/systems/quote/renderer");

module.exports = {

    data: new SlashCommandBuilder()

        .setName("quote")
        .setDescription("Créer une magnifique citation")

        .addStringOption(option =>
            option
                .setName("texte")
                .setDescription("La citation")
                .setRequired(true)
                .setMaxLength(500)
        )

        .addUserOption(option =>
            option
                .setName("auteur")
                .setDescription("Auteur")
                .setRequired(false)
        )

        .addStringOption(option =>
            option
                .setName("theme")
                .setDescription("Choisir un thème")
                .setRequired(false)
                .addChoices(
                    {
                        name: "Shiiro",
                        value: "shiiro"
                    },
                    {
                        name: "Noir",
                        value: "noir"
                    },
                    {
                        name: "Galaxy",
                        value: "galaxy"
                    },
                    {
                        name: "Sunset",
                        value: "sunset"
                    }
                )
        ),

    async execute(interaction) {

        await interaction.deferReply();

        const renderer = new QuoteRenderer();

        const author =
            interaction.options.getUser("auteur")
            || interaction.user;

        const member =
            await interaction.guild.members
                .fetch(author.id)
                .catch(() => null);

        const buffer =
            await renderer.render({

                text:
                    interaction.options.getString("texte"),

                author:
                    member?.displayName
                    || author.displayName
                    || author.username,

                username:
                    author.username,

                avatar: author.displayAvatarURL({
    extension: "png",
    size: 1024
}),


                theme:
                    interaction.options.getString("theme")
                    || "shiiro"

            });

        const file =
            new AttachmentBuilder(buffer, {
                name: "quote.png"
            });

        await interaction.editReply({

            files: [
                file
            ]

        });

    }

};
