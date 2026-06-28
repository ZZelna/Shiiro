const {
 SlashCommandBuilder,
 EmbedBuilder
} = require("discord.js");

const CasinoProfile = require("../models/CasinoProfile");

const allowedRoles = ["1506674274826584284"];
const LOGS_CASINO = "1520766436388245585";

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

   await interaction.reply({
     embeds: [
       new EmbedBuilder()
         .setColor("Red")
         .setTitle("🗑️ Reset Casino")
         .setDescription(`✅ **${result.deletedCount}** profil(s) casino supprimé(s).`)
     ]
   });

   try {
     const logsGuild = interaction.client.guilds.cache.find(g =>
       g.channels.cache.has(LOGS_CASINO)
     );
     const logsChannel = logsGuild?.channels.cache.get(LOGS_CASINO);
     if (logsChannel) {
       await logsChannel.send({
         content: `\`\`\`- Reset Casino effectué.\nModérateur: ${interaction.user.username} (ID: ${interaction.user.id})\nProfils supprimés: ${result.deletedCount}\nAction: Base de données casino réinitialisée. 🗑️\`\`\``
       });
     }
   } catch {}
 }
};
