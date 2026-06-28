const {
 SlashCommandBuilder,
 EmbedBuilder
} = require("discord.js");

const CasinoProfile = require("../models/CasinoProfile");

const DAILY_LIMIT = 500000;

module.exports = {
 data: new SlashCommandBuilder()
   .setName("pileface")
   .setDescription("Parie des yens à pile ou face.")
   .addStringOption(option =>
     option.setName("côté")
       .setDescription("Pile ou Face ?")
       .setRequired(true)
       .addChoices(
         { name: "Pile", value: "pile" },
         { name: "Face", value: "face" }
       )
   )
   .addIntegerOption(option =>
     option.setName("mise")
       .setDescription("Montant à parier.")
       .setRequired(true)
       .setMinValue(1)
   ),

 async execute(interaction) {
   const side = interaction.options.getString("côté");
   const bet = interaction.options.getInteger("mise");

   const user = await CasinoProfile.findOne({ userId: interaction.user.id });

   if (!user) {
     return interaction.reply({
       content: "❌ Tu n'as pas de profil casino. Utilise `/casino` pour en créer un.",
       ephemeral: true
     });
   }

   if (user.yens < bet) {
     return interaction.reply({
       content: `❌ Tu n'as pas assez de yens. Tu as **${user.yens} Yens**.`,
       ephemeral: true
     });
   }

   // Reset du compteur journalier
   const now = new Date();
   const lastDaily = user.lastDaily ? new Date(user.lastDaily) : null;
   const sameDay = lastDaily &&
     lastDaily.getDate() === now.getDate() &&
     lastDaily.getMonth() === now.getMonth() &&
     lastDaily.getFullYear() === now.getFullYear();

   if (!sameDay) {
     user.lastDaily = now;
     user.dailyBet = 0;
   }

   const alreadyBet = user.dailyBet ?? 0;

   if (alreadyBet + bet > DAILY_LIMIT) {
     const remaining = DAILY_LIMIT - alreadyBet;
     return interaction.reply({
       content: `❌ Tu as atteint la limite journalière. Il te reste **${remaining} Yens** à parier aujourd'hui.`,
       ephemeral: true
     });
   }

   const result = Math.random() < 0.5 ? "pile" : "face";
   const win = result === side;

   if (win) {
     user.yens += bet;
   } else {
     user.yens -= bet;
   }

   user.dailyBet = alreadyBet + bet;
   await user.save();

   return interaction.reply({
     embeds: [
       new EmbedBuilder()
         .setColor(win ? "Green" : "Red")
         .setTitle(win ? "✅ Gagné !" : "❌ Perdu !")
         .setDescription(
           `Tu as choisi **${side}**, c'était **${result}**.\n` +
           `${win ? `Tu gagnes **${bet} Yens** !` : `Tu perds **${bet} Yens** !`}\n\n` +
           `💴 Solde : **${user.yens} Yens**`
         )
     ]
   });
 }
};
