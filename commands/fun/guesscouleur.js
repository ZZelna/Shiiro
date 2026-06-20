const {
    EmbedBuilder,
    AttachmentBuilder
} = require("discord.js");

const Canvas =
    require("@napi-rs/canvas");

const colors =
    require("../../data/colors.json");

module.exports = {
    name: "guesscouleur",
    description:
        "Deviner une couleur",

    run: async (
        client,
        message,
        args
    ) => {

        const color =
            colors[
                Math.floor(
                    Math.random() *
                    colors.length
                )
            ];

        const canvas =
            Canvas.createCanvas(
                512,
                512
            );

        const ctx =
            canvas.getContext("2d");

        ctx.fillStyle =
            color.hex;

        ctx.fillRect(
            0,
            0,
            512,
            512
        );

        const attachment =
            new AttachmentBuilder(
                await canvas.encode("png"),
                {
                    name:
                        "color.png"
                }
            );

        const embed =
            new EmbedBuilder()

                .setTitle(
                    "🎨 Devine la couleur"
                )

                .setDescription(
                    "Tu as **30 secondes** pour trouver le nom exact de cette couleur."
                )

                .setImage(
                    "attachment://color.png"
                )

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
                    color.name
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
                                    `La couleur était **${color.name}**.`
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
                                `La bonne réponse était **${color.name}**.`
                            )
                    ]
                });

            }
        );

    }
};
