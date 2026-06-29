const { EmbedBuilder } = require("discord.js");
const CasinoProfile = require("../../models/CasinoProfile");
const countries = require("../../data/countries.json");

module.exports = {
    name: "guesscountry",

    run: async (message, args, options = {}) => {

        if (!message.member && !options.auto) return;

        if (!options.auto) {
            const roleAllowed = "1506674274826584284";
            if (!message.member.roles.cache.has(roleAllowed)) {
                return message.reply("❌ Tu n'as pas la permission d'utiliser ce mini-jeu.");
            }
        }

        const difficulties = ["easy", "medium", "hard", "extreme"];
        const difficulty = difficulties.includes(args?.[0]?.toLowerCase())
            ? args[0].toLowerCase()
            : "medium";

        const question = countries[Math.floor(Math.random() * countries.length)];

        if (!question || !question[difficulty]) {
            if (options?.onEnd) options.onEnd();
            return;
        }

        const embed = new EmbedBuilder()
            .setColor("#5865F2")
            .setTitle("🌍 Guess Country")
            .addFields({ name: "📊 Difficulté", value: difficulty.toUpperCase(), inline: true })
            .setDescription(`📖 Indice :\n\n${question[difficulty]}\n\n⏱️ Vous avez 30 secondes !`);

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
            if (m.content.toLowerCase().trim() === question.country.toLowerCase()) {
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
        ? `${m.author} a trouvé !\n\n🌍 Pays : **${question.country}**\n📊 Difficulté : **${difficulty.toUpperCase()}**`
        : `${m.author} a trouvé !\n\n🌍 Pays : **${question.country}**\n📊 Difficulté : **${difficulty.toUpperCase()}**\n\nRécompense : ${rewardText}`
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
                            .setDescription(`🌍 Réponse : **${question.country}**\n📊 Difficulté : **${difficulty.toUpperCase()}**`)
                            .setTimestamp()
                    ]
                });
            }
            safeEnd();
        });
    }
};
