const {
    EmbedBuilder
} = require("discord.js");

const countries =
require("../../data/countries.json");

module.exports = {

    name: "guesscountry",

    async run(message) {

        const question =
            countries[
                Math.floor(
                    Math.random() *
                    countries.length
                )
            ];

        const embed =
            new EmbedBuilder()

            .setColor("#5865F2")

            .setTitle(
                "🌍 Guess Country"
            )

            .setDescription(
`📖 Description :

${question.description}

⏱️ Vous avez 30 secondes !`
            );

        await message.channel.send({
            embeds: [embed]
        });

        const collector =
            message.channel.createMessageCollector({
                filter: m =>
                    !m.author.bot,
                time: 30000
            });

        collector.on(
            "collect",
            async m => {

                if (
                    m.content.toLowerCase() ===
                    question.country.toLowerCase()
                ) {

                    await message.channel.send({
                        embeds: [
                            new EmbedBuilder()
                            .setColor("#57F287")
                            .setTitle(
                                "✅ Bonne réponse"
                            )
                            .setDescription(
`${m.author} a trouvé !

🌍 Pays :
**${question.country}**`
                            )
                        ]
                    });

                    collector.stop();

                }

            }
        );

        collector.on(
            "end",
            async (_, reason) => {

                if (
                    reason ===
                    "time"
                ) {

                    await message.channel.send({
                        embeds: [
                            new EmbedBuilder()
                            .setColor("#ED4245")
                            .setTitle(
                                "⏰ Temps écoulé"
                            )
                            .setDescription(
`🌍 Réponse :

**${question.country}**`
                            )
                        ]
                    });

                }

            }
        );

    }

};
