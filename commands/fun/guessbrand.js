const {
    EmbedBuilder,
    AttachmentBuilder
} = require("discord.js");

const brands =
    require("../../data/brands.json");

const path = require("path");

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

        const file =
            new AttachmentBuilder(
                path.join(
                    __dirname,
                    "../../assets/logos",
                    question.image
                )
            );

        const embed =
            new EmbedBuilder()

            .setColor("Blue")

            .setTitle(
                "🏷️ Guess Brand"
            )

            .setDescription(
                "Quelle est cette marque ?"
            )

            .setImage(
                `attachment://${question.image}`
            )

            .setFooter({
                text:
                    "30 secondes"
            });

        await message.channel.send({
            embeds: [embed],
            files: [file]
        });

        const collector =
            message.channel.createMessageCollector({
                filter: m => !m.author.bot,
                time: 30000
            });

        collector.on(
            "collect",
            async m => {

                if (
                    m.content.toLowerCase() ===
                    question.brand.toLowerCase()
                ) {

                    collector.stop();

                    return message.channel.send({
                        embeds: [
                            new EmbedBuilder()
                            .setColor("Green")
                            .setTitle(
                                "✅ Bonne réponse"
                            )
                            .setDescription(
                                `${m.author} a trouvé **${question.brand}**`
                            )
                        ]
                    });

                }

            }
        );

        collector.on(
            "end",
            async (_, reason) => {

                if (
                    reason === "time"
                ) {

                    await message.channel.send({
                        embeds: [
                            new EmbedBuilder()
                            .setColor("Red")
                            .setTitle(
                                "⏰ Temps écoulé"
                            )
                            .setDescription(
                                `Réponse : **${question.brand}**`
                            )
                        ]
                    });

                }

            }
        );

    }
};
