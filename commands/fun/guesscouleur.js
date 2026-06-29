const { EmbedBuilder, AttachmentBuilder } = require("discord.js");
const Canvas = require("@napi-rs/canvas");
const CasinoProfile = require("../../models/CasinoProfile");
const colors = require("../../data/colors.json");

module.exports = {
    name: "guesscouleur",

    run: async (message, args, options = {}) => {

        if (!message.member && !options.auto) return;

if (!options.auto && !options.fromGames) {
            const roleAllowed = "1506674274826584284";
            if (!message.member.roles.cache.has(roleAllowed)) {
                return message.reply("❌ Tu n'as pas la permission d'utiliser ce mini-jeu.");
            }
        }

        const color = colors[Math.floor(Math.random() * colors.length)];
        const canvas = Canvas.createCanvas(512, 512);
        const ctx = canvas.getContext("2d");
        ctx.fillStyle = color.hex;
        ctx.fillRect(0, 0, 512, 512);

        const attachment = new AttachmentBuilder(await canvas.encode("png"), { name: "color.png" });

        const embed = new EmbedBuilder()
            .setTitle("🎨 Devine la couleur")
            .setDescription("Tu as **30 secondes** pour trouver le nom exact de cette couleur.")
            .setImage("attachment://color.png")
            .setFooter({ text: "Réponds dans le chat" });

        await message.channel.send({ embeds: [embed], files: [attachment] });

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
            if (m.content.toLowerCase().trim() === color.name.toLowerCase()) {
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
        ? `La couleur était **${color.name}**.`
        : `La couleur était **${color.name}**.\n\nRécompense : ${rewardText}`
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
                            .setDescription(`La bonne réponse était **${color.name}**.`)
                            .setTimestamp()
                    ]
                });
            }
            safeEnd();
        });
    }
};
