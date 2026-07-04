const { EmbedBuilder, AttachmentBuilder } = require("discord.js");
const path = require("path");
const CasinoProfile = require("../../models/CasinoProfile");
const { distance } = require("fastest-levenshtein");

let lastAnime = null;

module.exports = {
    name: "guessanime",
    description: "Deviner un anime à partir d'une scène",

    run: async (message, args, options = {}) => {

        if (!message.member && !options.auto) return;

        if (!options.auto && !options.fromGames) {
            const roleAllowed = "1506674274826584284";
            if (!message.member.roles.cache.has(roleAllowed)) {
                return message.reply("❌ Tu n'as pas la permission d'utiliser ce mini-jeu.");
            }
        }

        delete require.cache[require.resolve("../../data/animes.json")];
        const animes = require("../../data/animes.json");

        let anime;
        do {
            anime = animes[Math.floor(Math.random() * animes.length)];
        } while (animes.length > 1 && anime.anime === lastAnime);

        lastAnime = anime.anime;

        const imagePath = path.join(__dirname, "../../assets/animes", anime.image);
        const attachment = new AttachmentBuilder(imagePath);

        const embed = new EmbedBuilder()
            .setColor("#5865F2")
            .setTitle("🎌 Devine l'anime")
            .setDescription("Tu as **30 secondes** pour trouver le nom de cet anime.")
            .setImage(`attachment://${anime.image}`)
            .setFooter({ text: "Réponds dans le chat" });

        await message.channel.send({
            embeds: [embed],
            files: [attachment]
        });

        const collector = message.channel.createMessageCollector({
            filter: m => !m.author.bot && m.channel.id === message.channel.id,
            time: 30000
        });

        let ended = false;

        const safeEnd = () => {
            if (ended) return;
            ended = true;
            if (options?.onEnd) options.onEnd();
        };

        collector.on("collect", async m => {

            const guess = m.content.toLowerCase().trim();

            const answers = [
                anime.anime.toLowerCase(),
                ...(anime.aliases || []).map(a => a.toLowerCase())
            ];

            // Bonne réponse
            if (answers.includes(guess)) {

                collector.stop("found");

                let rewardText = "🎮 Aucune récompense";

                if (options.reward !== false) {

                    const isGift = Math.random() < 0.10;

                    if (isGift) {

                        await CasinoProfile.findOneAndUpdate(
                            { userId: m.author.id },
                            { $inc: { gifts: 1 } },
                            { upsert: true }
                        );

                        rewardText = "🎁 1 Gift";

                    } else {

                        const reward = Math.floor(Math.random() * 901) + 100;

                        await CasinoProfile.findOneAndUpdate(
                            { userId: m.author.id },
                            { $inc: { yens: reward } },
                            { upsert: true }
                        );

                        rewardText = `💴 ${reward} Yens`;

                    }

                }

                await m.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor("#57F287")
                            .setTitle("✅ Bonne réponse")
                            .setDescription(
                                options.reward === false
                                    ? `L'anime était **${anime.anime}**.`
                                    : `L'anime était **${anime.anime}**.\n\nRécompense : ${rewardText}`
                            )
                            .setTimestamp()
                    ]
                });

                return safeEnd();
            }

            // Tu y es presque !
            const close = answers.some(answer => {
                const dist = distance(guess, answer);
                return dist <= Math.max(2, Math.floor(answer.length * 0.25));
            });

            if (close) {
                await m.reply("🟡 Tu y es presque !");
            }

        });

        collector.on("end", async (_, reason) => {

            if (reason !== "found") {
                await message.channel.send({
                    embeds: [
                        new EmbedBuilder()
                            .setColor("#ED4245")
                            .setTitle("⏰ Temps écoulé")
                            .setDescription(`La bonne réponse était **${anime.anime}**.`)
                            .setTimestamp()
                    ]
                });
            }

            safeEnd();

        });

    }
};
