module.exports = {
    name: "guessanime",
    description: "Deviner un anime à partir d'une scène",

    run: async (
        message,
        args
    ) => {

        const {
            EmbedBuilder,
            AttachmentBuilder
        } = require("discord.js");

        const path =
            require("path");

        const animes =
            require("../../data/animes.json");

        const anime =
            animes[
                Math.floor(
                    Math.random() *
                    animes.length
                )
            ];

        const imagePath =
            path.join(
                __dirname,
                "../../assets/animes",
                anime.image
            );

        const attachment =
            new AttachmentBuilder(
                imagePath
            );

        const embed =
            new EmbedBuilder()

                .setColor(
                    "#5865F2"
                )

                .setTitle(
                    "🎌 Devine l'anime"
                )

                .setDescription(
                    "Tu as **30 secondes** pour trouver le nom de cet anime."
                )

.setImage(`attachment://${anime.image}`)

                .setFooter({
                    text:
                        "Réponds dans le chat"
                });

        await message.channel.send({
            embeds: [embed],
            files: [attachment]
        });

        const filter = m =>
            !m.author.bot &&
            m.channel.id ===
                message.channel.id;

        const collector =
            message.channel.createMessageCollector({
                filter,
                time: 30000
            });

        collector.on(
            "collect",
            async m => {

                if (
                    m.content
                        .toLowerCase()
                        .trim() ===
                    anime.anime
                        .toLowerCase()
                ) {

                    collector.stop(
                        "found"
                    );

                    return m.reply({
                        embeds: [
                            new EmbedBuilder()

                                .setColor(
                                    "#57F287"
                                )

                                .setTitle(
                                    "✅ Bonne réponse"
                                )

                                .setDescription(
                                    `L'anime était **${anime.anime}**.`
                                )
                        ]
                    });

                }

            }
        );

        collector.on(
            "end",
            async (
                collected,
                reason
            ) => {

                if (
                    reason ===
                    "found"
                )
                    return;

                await message.channel.send({
                    embeds: [
                        new EmbedBuilder()

                            .setColor(
                                "#ED4245"
                            )

                            .setTitle(
                                "⏰ Temps écoulé"
                            )

                            .setDescription(
                                `La bonne réponse était **${anime.anime}**.`
                            )
                    ]
                });

            }
        );

    }
};
