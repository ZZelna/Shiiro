const {
 SlashCommandBuilder,
 EmbedBuilder
} = require("discord.js");

const CasinoProfile = require("../models/CasinoProfile");

const allowedRoles = ["1506709088451690708", "1506674274826584284"];
const LOGS_CASINO = "1520766436388245585";

module.exports = {
 data: new SlashCommandBuilder()
   .setName("giveboost")
   .setDescription("Offre un boost à un membre.")
   .addUserOption(option =>
     option.setName("membre")
       .setDescription("Le membre à booster.")
       .setRequired(true)
   )
   .addIntegerOption(option =>
     option.setName("multiplicateur")
       .setDescription("Multiplicateur de yens (ex: 2, 3...)")
       .setRequired(true)
       .setMinValue(2)
   )
   .addIntegerOption(option =>
     option.setName("durée")
       .setDescription("Durée du boost en minutes.")
       .setRequired(true)
       .setMinValue(1)
   ),

 async execute(interaction) {
   const hasRole = interaction.member.roles.cache.some(r => allowedRoles.includes(r.id));

   if (!hasRole) {
     return interaction.reply({
       content: "❌ Tu n'as pas la permission d'utiliser cette commande.",
       ephemeral: true
     });
   }

   const target = interaction.options.getUser("membre");
   const multiplier = interaction.options.getInteger("multiplicateur");
   const duration = interaction.options.getInteger("durée");

   const user = await CasinoProfile.findOne({ userId: target.id });

   if (!user) {
     return interaction.reply({
       content: `❌ ${target} n'a pas de profil casino.`,
       ephemeral: true
     });
   }

   user.boostMultiplier = multiplier;
   user.boostEnd = new Date(Date.now() + duration * 60 * 1000);
   await user.save();

   await interaction.reply({
     embeds: [
       new EmbedBuilder()
         .setColor("Gold")
         .setTitle("💰 Boost offert")
         .setDescription(`${target} reçoit un boost **x${multiplier}** pendant **${duration} minute(s)** !`)
     ]
   });

   try {
     const logsGuild = interaction.client.guilds.cache.find(g =>
       g.channels.cache.has(LOGS_CASINO)
     );
     const logsChannel = logsGuild?.channels.cache.get(LOGS_CASINO);
     if (logsChannel) {
       await logsChannel.send({
         content: `\`\`\`- Boost offert.\nUtilisateur: ${target.username} (ID: ${target.id})\nModérateur: ${interaction.user.username} (ID: ${interaction.user.id})\nMultiplicateur: x${multiplier}\nDurée: ${duration} minute(s)\nAction: Boost activé. 💰\`\`\``
       });
     }
   } catch {}
 }
};
