const {
   EmbedBuilder,
   AttachmentBuilder
} = require("discord.js");

const Canvas = require("@napi-rs/canvas");
const CasinoProfile = require("../../models/CasinoProfile");
const colors = require("../../data/colors.json");

module.exports = {
   name: "guesscouleur",
   description: "Deviner une couleur",

   run: async (message, args, options = {}) => {

       if (!message.member && !options.auto) return;

       if (!options.auto) {
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

       const attachment = new AttachmentBuilder(
           await canvas.encode("png"),
           { name: "color.png" }
       );

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

       collector.on("collect", async m => {
           if (m.content.toLowerCase().trim() === color.name.toLowerCase()) {
               collector.stop("found");

               // ✅ Récompense
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

               return m.reply({
                   embeds: [
                       new EmbedBuilder()
                           .setColor("#57F287")
                           .setTitle("✅ Bonne réponse")
                           .setDescription(
                               `La couleur était **${color.name}**.\n\nRécompense : ${rewardText}`
                           )
                           .setTimestamp()
                   ]
               });
           }
       });

       collector.on("end", async (collected, reason) => {
           if (reason === "found") return;

           await message.channel.send({
               embeds: [
                   new EmbedBuilder()
                       .setColor("#ED4245")
                       .setTitle("⏰ Temps écoulé")
                       .setDescription(`La bonne réponse était **${color.name}**.`)
                       .setTimestamp()
               ]
           });
       });
   }
};
