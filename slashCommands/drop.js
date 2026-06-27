const {
 SlashCommandBuilder,
 EmbedBuilder,
 ActionRowBuilder,
 ButtonBuilder,
 ButtonStyle
} = require("discord.js");

const CasinoProfile = require("../models/CasinoProfile");

module.exports = {
 data: new SlashCommandBuilder()
   .setName("drop")
   .setDescription("Lance un drop."),

 async execute(interaction) {
   const button = new ButtonBuilder()
     .setCustomId("claim_drop")
     .setLabel("🎉 Récupérer")
     .setStyle(ButtonStyle.Success);

   const row = new ActionRowBuilder().addComponents(button);

   const embed = new EmbedBuilder()
     .setColor("Gold")
     .setTitle("🎁 DROP")
     .setDescription("Le premier à cliquer sur **🎉 Récupérer** gagne une récompense !");

   const msg = await interaction.reply({
     embeds: [embed],
     components: [row],
     fetchReply: true
   });

   const collector = msg.createMessageComponentCollector({
     time: 60000
   });

   collector.on("collect", async (i) => {
     const user = await CasinoProfile.findOne({ userId: i.user.id });

     if (!user) {
       await i.reply({
         content: "❌ Tu n'as pas de profil casino. Utilise vas dans creer mon profil pour en créer un.",
         ephemeral: true
       });
       return;
     }

     collector.stop("claimed");

     const random = Math.random();
     let reward = "";

     if (random < 0.60) {
       const value = Math.floor(Math.random() * 4000) + 1000;
       user.yens += value;
       reward = `💴 **${value} Yens**`;
     } else if (random < 0.90) {
       user.gifts += 1;
       reward = "🎁 **1 Gift**";
     } else {
       user.boostMultiplier = 2;
       user.boostEnd = new Date(Date.now() + 60 * 60 * 1000);
       reward = "💰 **1 Doubleur de Yens (1h)**";
     }

     await user.save();

     button.setDisabled(true);

     await i.update({
       embeds: [
         new EmbedBuilder()
           .setColor("Green")
           .setTitle("🎉 Drop récupéré")
           .setDescription(`${i.user} a remporté ${reward} !`)
       ],
       components: [new ActionRowBuilder().addComponents(button)]
     });
   });

   collector.on("end", async (collected, reason) => {
     if (reason === "claimed") return;

     button.setDisabled(true);

     await msg.edit({
       embeds: [
         new EmbedBuilder()
           .setColor("Red")
           .setTitle("❌ Drop expiré")
           .setDescription("Personne n'a récupéré le drop.")
       ],
       components: [new ActionRowBuilder().addComponents(button)]
     }).catch(() => {});
   });
 }
};
