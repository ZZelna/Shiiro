const {
 SlashCommandBuilder,
 EmbedBuilder
} = require("discord.js");

const CasinoProfile = require("../models/CasinoProfile");

const COOLDOWN = 30 * 60 * 1000;

module.exports = {
 data: new SlashCommandBuilder()
   .setName("rob")
   .setDescription("Pille les yens d'un membre.")
   .addUserOption(option =>
     option.setName("membre")
       .setDescription("Le membre à piller.")
       .setRequired(true)
   ),

 async execute(interaction) {
   const target = interaction.options.getUser("membre");

   if (target.id === interaction.user.id) {
     return interaction.reply({
       content: "❌ Tu ne peux pas te piller toi-même.",
       ephemeral: true
     });
   }

   if (target.bot) {
     return interaction.reply({
       content: "❌ Tu ne peux pas piller un bot.",
       ephemeral: true
     });
   }

   const robber = await CasinoProfile.findOne({ userId: interaction.user.id });

   if (!robber) {
     return interaction.reply({
       content: "❌ Tu n'as pas de profil casino. Utilise `/casino` pour en créer un.",
       ephemeral: true
     });
   }

   const now = Date.now();
   if (robber.lastClaim && now - robber.lastClaim < COOLDOWN) {
     const remaining = COOLDOWN - (now - robber.lastClaim);
     const minutes = Math.floor(remaining / 60000);
     const seconds = Math.floor((remaining % 60000) / 1000);
     return interaction.reply({
       content: `⏳ Tu dois attendre encore **${minutes}m ${seconds}s** avant de piller à nouveau.`,
       ephemeral: true
     });
   }

   const victim = await CasinoProfile.findOne({ userId: target.id });

   if (!victim) {
     return interaction.reply({
       content: `❌ ${target} n'a pas de profil casino.`,
       ephemeral: true
     });
   }

   if (victim.yens <= 0) {
     return interaction.reply({
       content: `❌ ${target} n'a pas de yens à voler.`,
       ephemeral: true
     });
   }

   const stolen = Math.min(Math.floor(Math.random() * 5001), victim.yens);

   victim.yens -= stolen;
   robber.yens += stolen;
   robber.lastClaim = now;

   await victim.save();
   await robber.save();

   return interaction.reply({
     embeds: [
       new EmbedBuilder()
         .setColor("DarkRed")
         .setTitle("😉 Vol réussi !")
         .setDescription(`${interaction.user} a pillé **${stolen} Yens** à ${target} !`)
     ]
   });
 }
};
