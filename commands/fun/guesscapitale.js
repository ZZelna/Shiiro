const {
    EmbedBuilder
} = require("discord.js");

const questions =
    require("../../data/capitales.json");

module.exports = {

    name: "guesscapitale",

    async run(message) {

        const question =
            questions[
                Math.floor(
                    Math.random() *
                    questions.length
                )
            ];

        const embed =
            new EmbedBuilder()

            .setColor("Blue")

            .setTitle(
                "🌍 Guess Capitale"
            )

            .setDescription(
`Quelle est la capitale de **${question.country}** ?`
            )

            .setFooter({
                text:
                    "Tu as 30 secondes pour répondre"
            })

            .setTimestamp();

        await message.channel.send({
            embeds: [embed]
        });

        const filter = m =>
            !m.author.bot;

        const collector =
            message.channel.createMessageCollector({
                filter,
                time: 30000
            });

        collector.on(
    "collect",
    async m => {

        if (
            m.content.toLowerCase() ===
            question.capital.toLowerCase()
        ) {

            const winEmbed =
                new EmbedBuilder()

                .setColor("Green")

                .setTitle(
                    "✅ Bonne réponse !"
                )

                .setDescription(
                    `${m.author} a trouvé la capitale de **${question.country}**.\n\nRéponse : **${question.capital}**`
                );

            await message.channel.send({
                embeds: [winEmbed]
            });

            collector.stop();

        }

    }
);
