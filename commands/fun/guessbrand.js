const {
    EmbedBuilder
} = require("discord.js");

const brands =
    require("../../data/brands.json");

module.exports = {

    name: "guessbrand",

    async run(message) {

        const question =
            brands[
                Math.floor(
                    Math.random() *
                    brands.length
                )
            ];

        const embed =
            new EmbedBuilder()

            .setColor("Blue")

            .setTitle(
                "🏷️ Guess Brand"
            )

            .setDescription(
                "Quelle est cette marque ?"
            )

.setImage("https://i.imgur.com/1X4Jm6A.png")

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
                    m.content.toLowerCase()
                    ===
                    question.name.toLowerCase()
                ) {

                    const winEmbed =
                        new EmbedBuilder()

                        .setColor(
                            "Green"
                        )

                        .setTitle(
                            "✅ Bonne réponse !"
                        )

                        .setDescription(
                            `${m.author} a trouvé la marque !\n\n🏷️ Réponse : **${question.name}**`
                        )


                        .setImage("https://i.imgur.com/1X4Jm6A.png")
                        
                        .setTimestamp();

                    await message.channel.send({
                        embeds: [winEmbed]
                    });

                    collector.stop();

                }

            }
        );

        collector.on(
            "end",
            async (_, reason) => {
                

                if (
                    reason === "time"
                ) {

                    const loseEmbed =
                        new EmbedBuilder()

                        .setColor(
                            "Red"
                        )

                        .setTitle(
                            "⏰ Temps écoulé"
                        )

                        .setDescription(
                            `Personne n'a trouvé.\n\n🏷️ Réponse : **${question.name}**`
                        )

                    .setImage("https://i.imgur.com/1X4Jm6A.png")
                        .setTimestamp();

                    await message.channel.send({
                        embeds: [loseEmbed]
                    });

                }

            }
        );

    }
};
