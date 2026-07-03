const { EmbedBuilder, AttachmentBuilder } = require("discord.js");
const path = require("path");
const CasinoProfile = require("../../models/CasinoProfile");

let lastFilm = null;

module.exports = {
    name: "guessfilms",
    description: "Deviner un film à partir d'une scène",

    run: async (message, args, options = {}) => {

        if (!message.member && !options.auto) return;

        if (!options.auto && !options.fromGames) {
            const roleAllowed = "1506674274826584284";
            if (!message.member.roles.cache.has(roleAllowed)) {
                return message.reply("❌ Tu n'as pas la permission d'utiliser ce mini-jeu.");
            }
        }

        delete require.cache[require.resolve("../../data/films.json")];
        const films = require("../../data/films.json");

        let film;
        do {
            film = films[Math.floor(Math.random() * films.length)];
        } while (films.length > 1 && film.id === lastFilm);

        lastFilm = film.id;

        const imagePath = path.join(__dirname, "../../assets", film.image);

        const attachment = new AttachmentBuilder(imagePath, {
            name: path.basename(film.image)
        });

        const embed = new EmbedBuilder()
            .setColor("#5865F2")
            .setTitle("🎬 Devine le film")
            .setDescription("Tu as **30 secondes** pour trouver le nom de ce film.")
            .setImage(`attachment://${path.basename(film.image)}`)
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

            const answer = m.content.toLowerCase().trim();

            const valid =
                answer === film.title.toLowerCase() ||
                (film.aliases &&
                    film.aliases.some(alias => alias.toLowerCase() === answer));

            if (!valid) return;

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
                                ? `Le film était **${film.title}**.`
                                : `Le film était **${film.title}**.\n\nRécompense : ${rewardText}`
                        )
                        .setTimestamp()
                ]
            });

            safeEnd();

        });

        collector.on("end", async (_, reason) => {

            if (reason !== "found") {
                await message.channel.send({
                    embeds: [
                        new EmbedBuilder()
                            .setColor("#ED4245")
                            .setTitle("⏰ Temps écoulé")
                            .setDescription(`La bonne réponse était **${film.title}**.`)
                            .setTimestamp()
                    ]
                });
            }

            safeEnd();

        });

    }
};
