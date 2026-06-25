const {
EmbedBuilder,
AttachmentBuilder
} = require("discord.js");

const path =
require("path");

const CasinoProfile =
require("../../models/CasinoProfile");

let lastAnime = null;

module.exports = {
name: "guessanime",

description:
    "Deviner un anime à partir d'une scène",

run: async (
    message,
    args
) => {

    const roleAllowed =
        "1506674274826584284";

    if (
        !message.member.roles.cache.has(
            roleAllowed
        )
    ) {

        return message.reply(
            "❌ Tu n'as pas la permission d'utiliser ce mini-jeu."
        );

    }

    delete require.cache[
        require.resolve(
            "../../data/animes.json"
        )
    ];

    const animes =
        require(
            "../../data/animes.json"
        );

    let anime;

    do {

        const randomIndex =
            Math.floor(
                Math.random() *
                animes.length
            );

        anime =
            animes[randomIndex];

    } while (
        animes.length > 1 &&
        anime.anime ===
        lastAnime
    );

    lastAnime =
        anime.anime;

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

            .setImage(
                `attachment://${anime.image}`
            )

            .setFooter({
                text:
                    "Réponds dans le chat"
            });

    await message.channel.send({
        embeds: [embed],
        files: [attachment]
    });

    const filter =
        m =>
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

                const isGift =
                    Math.random() < 0.10;

                let rewardText;

                if (
                    isGift
                ) {

                   await CasinoProfile.findOneAndUpdate(
                        {
                            userId:
                                m.author.id
                        },
                        {
                            $inc: {
                                gifts: 1
                            }
                        },
                        {
                            upsert: true
                        }
                    );

                    rewardText =
                        "🎁 1 Gift";

                } else {

                    const reward =
                        Math.floor(
                            Math.random() *
                            901
                        ) + 100;

await CasinoProfile.findOneAndUpdate(
                        {
                            userId:
                                m.author.id
                        },
                        {
                            $inc: {
                                yens: reward
                            }
                        },
                        {
                            upsert: true
                        }
                    );

                    rewardText =
                        `💴 ${reward} yens`;

                }

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
                                `L'anime était **${anime.anime}**.\n\nRécompense : ${rewardText}`
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
