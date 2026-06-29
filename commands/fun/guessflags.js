const { EmbedBuilder } = require("discord.js");
const CasinoProfile = require("../../models/CasinoProfile");
const flags = require("../../data/flags.json");

module.exports = {
    name: "guessflags",

    run: async (message, args, options = {}) => {

        if (!message.member && !options.auto) return;

        if (!options.auto) {
            const roleAllowed = "1506674274826584284";
            if (!message.member.roles.cache.has(roleAllowed)) {
                return message.reply("❌ Tu n'as pas la permission d'utiliser ce mini-jeu.");
            }
        }

        const random = flags[Math.floor(Math.random() * flags.length)];

        const embed = new EmbedBuilder()
            .setColor(0x3498db)
            .setTitle("🌍 Guess The Flag")
            .setDescription("Quel pays correspond à ce drapeau ?")
            .setImage(`https://raw.githubusercontent.com/ZZelna/Shiiro/main/assets/flags/${random.image}`)
            .setFooter({ text: "Tu as 30 secondes pour répondre" });

        await message.channel.send({ embeds: [embed] });

        const collector = message.channel.createMessageCollector({
            filter: m => !m.author.bot && m.channel.id === message.channel.id,
            time: 30000
        });

        collector.on("collect", async m => {
            if (m.content.toLowerCase().trim() === random.country.toLowerCase().trim()) {
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
                            .setColor("#57F287")
                            .setTitle("✅ Bonne réponse !")
                            .setDescription(`La réponse était **${random.country}**.\n\nRécompense : ${rewardText}`)
                            .setTimestamp()
                    ]
                });

                if (options?.onEnd) options.onEnd();
            }
        });

        collector.on("end", async (_, reason) => {
            if (reason !== "found") {
                await message.channel.send({
                    embeds: [
                        new EmbedBuilder()
                            .setColor("#ED4245")
                            .setTitle("⏰ Temps écoulé")
                            .setDescription(`La réponse était **${random.country}**.`)
                            .setTimestamp()
                    ]
                });
            }
            if (options?.onEnd) options.onEnd();
        });
    }
};
