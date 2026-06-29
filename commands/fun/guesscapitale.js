const { EmbedBuilder } = require("discord.js");
const CasinoProfile = require("../../models/CasinoProfile");
const questions = require("../../data/capitales.json");

module.exports = {
    name: "guesscapitale",

    run: async (message, args, options = {}) => {

        if (!message.member && !options.auto) return;

        if (!options.auto) {
            const roleAllowed = "1506674274826584284";
            if (!message.member.roles.cache.has(roleAllowed)) {
                return message.reply("❌ Tu n'as pas la permission d'utiliser ce mini-jeu.");
            }
        }

        const question = questions[Math.floor(Math.random() * questions.length)];

        const embed = new EmbedBuilder()
            .setColor("Blue")
            .setTitle("🌍 Guess Capitale")
            .setDescription(`Quelle est la capitale de **${question.country}** ?`)
            .setFooter({ text: "Tu as 30 secondes pour répondre" })
            .setTimestamp();

        await message.channel.send({ embeds: [embed] });

        const collector = message.channel.createMessageCollector({
            filter: m => !m.author.bot,
            time: 30000
        });

        let ended = false;
        const safeEnd = () => {
            if (ended) return;
            ended = true;
            if (options?.onEnd) options.onEnd();
        };

        collector.on("collect", async m => {
            if (m.content.toLowerCase() === question.capital.toLowerCase()) {
                collector.stop("found");

                const isGift = Math.random() < 0.10;
                let rewardText;

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

                await m.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor("Green")
                            .setTitle("✅ Bonne réponse !")
                            .setDescription(`${m.author} a trouvé la capitale de **${question.country}**.\n\nRéponse : **${question.capital}**\n\nRécompense : ${rewardText}`)
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
                            .setColor("Red")
                            .setTitle("⏰ Temps écoulé")
                            .setDescription(`Personne n'a trouvé.\n\nRéponse : **${question.capital}**`)
                            .setTimestamp()
                    ]
                });
            }
            safeEnd();
        });
    }
};
