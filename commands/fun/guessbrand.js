const { EmbedBuilder, AttachmentBuilder } = require("discord.js");
const path = require("path");
const CasinoProfile = require("../../models/CasinoProfile");
const brands = require("../../data/brands.json");

module.exports = {
    name: "guessbrand",

    run: async (message, args, options = {}) => {

        if (!message.member && !options.auto) return;

        if (!options.auto) {
            const roleAllowed = "1506674274826584284";
            if (!message.member.roles.cache.has(roleAllowed)) {
                return message.reply("❌ Tu n'as pas la permission d'utiliser ce mini-jeu.");
            }
        }

        const question = brands[Math.floor(Math.random() * brands.length)];
        const image = new AttachmentBuilder(path.join(__dirname, "../../assets/logos", question.image));

        const embed = new EmbedBuilder()
            .setColor("Blue")
            .setTitle("🏷️ Guess Brand")
            .setDescription("Quelle est cette marque ?")
            .setImage(`attachment://${question.image}`)
            .setFooter({ text: "Tu as 30 secondes pour répondre" })
            .setTimestamp();

        await message.channel.send({ embeds: [embed], files: [image] });

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
            if (m.content.toLowerCase() === question.name.toLowerCase()) {
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
                            .setDescription(`${m.author} a trouvé la marque !\n\n🏷️ Réponse : **${question.name}**\n\nRécompense : ${rewardText}`)
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
                            .setDescription(`Personne n'a trouvé.\n\n🏷️ Réponse : **${question.name}**`)
                            .setTimestamp()
                    ]
                });
            }
            safeEnd();
        });
    }
};
