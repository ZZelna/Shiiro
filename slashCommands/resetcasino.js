const {
 SlashCommandBuilder,
 EmbedBuilder
} = require("discord.js");

const CasinoProfile = require("../models/CasinoProfile");

const allowedRoles = ["1506674274826584284"];

module.exports = {
 data: new SlashCommandBuilder()
   .setName("resetcasino")
   .setDescription("Réinitialise et supprime tous les profils casino."),

 async execute(interaction) {
   const hasRole = interaction.member.roles.cache.some(r => allowedRoles.includes(r.id));

   if (!hasRole) {
     return interaction.reply({
       content: "❌ Tu n'as pas la permission d'utiliser cette commande.",
       ephemeral: true
     });
   }

   const result = await CasinoProfile.deleteMany({});

   return interaction.reply({
     embeds: [
       new EmbedBuilder()
         .setColor("Red")
         .setTitle("🗑️ Reset Casino")
         .setDescription(`✅ **${result.deletedCount}** profil(s) casino supprimé(s).`)
     ]
   });
 }
};
