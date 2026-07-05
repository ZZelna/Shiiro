const { EmbedBuilder } = require("discord.js");
const CasinoProfile = require("../../models/CasinoProfile");
const series = require("../data/series.json");

module.exports = {
    name: "serieguess",

    run: async (message, args, options = {}) => {

        if (!message.member && !options.auto) return;

        if (!options.auto && !options.fromGames) {
            const roleAllowed = "1506674274826584284";

            if (!message.member.roles.cache.has(roleAllowed)) {
                return message.reply("❌ Tu n'as pas la permission d'utiliser ce mini-jeu.");
            }
        }

        const question =
            series[Math.floor(Math.random() * series.length)];

        const embed = new EmbedBuilder()
            .setColor("#5865F2")
            .setTitle("📺 Guess Série")
            .setDescription(
                "Trouve le nom de cette série !\n\n⏱️ Tu as **30 secondes** pour répondre."
            )
            .setImage(question.image)
            .setFooter({ text: "Réponds dans le chat" });

        await message.channel.send({
            embeds: [embed]
        });

        const validAnswers = [
            question.name.toLowerCase().trim(),
            ...(question.aliases || []).map(a =>
                a.toLowerCase().trim()
            )
        ];

        const collector =
            message.channel.createMessageCollector({
                filter: m =>
                    !m.author.bot &&
                    m.channel.id === message.channel.id,
                time: 30000
            });

        let ended = false;

        const safeEnd = () => {
            if (ended) return;
            ended = true;

            if (options?.onEnd)
                options.onEnd();
        };

        collector.on("collect", async m => {

            const guess =
                m.content.toLowerCase().trim();

            if (validAnswers.includes(guess)) {

                collector.stop("found");

                let rewardText =
                    "🎮 Aucune récompense";

                if (options.reward !== false) {

                    const isGift =
                        Math.random() < 0.10;

                    if (isGift) {

                        await CasinoProfile.findOneAndUpdate(
                            { userId: m.author.id },
                            { $inc: { gifts: 1 } },
                            { upsert: true }
                        );

                        rewardText = "🎁 1 Gift";

                    } else {

                        const reward =
                            Math.floor(Math.random() * 901) + 100;

                        await CasinoProfile.findOneAndUpdate(
                            { userId: m.author.id },
                            { $inc: { yens: reward } },
                            { upsert: true }
                        );

                        rewardText =
                            `💴 ${reward} Yens`;

                    }

                }

                await m.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor("#57F287")
                            .setTitle("✅ Bonne réponse !")
                            .setDescription(
                                options.reward === false
                                    ? `${m.author} a trouvé !\n\n📺 Série : **${question.name}**`
                                    : `${m.author} a trouvé !\n\n📺 Série : **${question.name}**\n\nRécompense : ${rewardText}`
                            )
                            .setTimestamp()
                    ]
                });

                safeEnd();
            }

        });

        collector.on("end", async (_, reason) => {

            if (reason !== "found") {

                await message.channel.send({
                    embeds: [
                        new EmbedBuilder()
                            .setColor("#ED4245")
                            .setTitle("⏰ Temps écoulé")
                            .setDescription(
                                `Personne n'a trouvé.\n\n📺 Série : **${question.name}**`
                            )
                            .setTimestamp()
                    ]
                });

            }

            safeEnd();

        });

    }
};
