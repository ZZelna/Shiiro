const {
 SlashCommandBuilder,
 EmbedBuilder
} = require("discord.js");

const CasinoProfile = require("../models/CasinoProfile");

module.exports = {
 data: new SlashCommandBuilder()
   .setName("booststatus")
   .setDescription("Affiche le statut de ton boost casino."),

 async execute(interaction) {
   const user = await CasinoProfile.findOne({ userId: interaction.user.id });

   if (!user) {
     return interaction.reply({
       content: "❌ Tu n'as pas de profil casino. Utilise `/casino` pour en créer un.",
       ephemeral: true
     });
   }

   const now = Date.now();
   const boostActive = user.boostEnd && new Date(user.boostEnd).getTime() > now;

   if (!boostActive) {
     return interaction.reply({
       embeds: [
         new EmbedBuilder()
           .setColor("Grey")
           .setTitle("💰 Statut du boost")
           .setDescription("Tu n'as pas de boost actif en ce moment.")
       ],
       ephemeral: true
     });
   }

   const remaining = new Date(user.boostEnd).getTime() - now;
   const minutes = Math.floor(remaining / 60000);
   const seconds = Math.floor((remaining % 60000) / 1000);

   return interaction.reply({
     embeds: [
       new EmbedBuilder()
         .setColor("Gold")
         .setTitle("💰 Statut du boost")
         .setDescription(
           `🚀 Boost actif : **x${user.boostMultiplier}**\n` +
           `⏳ Temps restant : **${minutes}m ${seconds}s**`
         )
     ],
     ephemeral: true
   });
 }
};
