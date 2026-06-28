const {
   SlashCommandBuilder,
   EmbedBuilder
} = require("discord.js");

const CasinoProfile = require("../models/CasinoProfile");

const LOGS_CASINO = "1520766436388245585";

module.exports = {

   data: new SlashCommandBuilder()
       .setName("delgift")
       .setDescription("Retirer un gift à un joueur")
       .addUserOption(option =>
           option
               .setName("joueur")
               .setDescription("Joueur")
               .setRequired(true)
       ),

   async execute(interaction) {

       const roles = [
           "1506709088451690708",
           "1506674274826584284"
       ];

       if (
           !roles.some(role =>
               interaction.member.roles.cache.has(role)
           )
       ) {
           return interaction.reply({
               content: "❌ Permission refusée.",
               ephemeral: true
           });
       }

       const target = interaction.options.getUser("joueur");

       const profile = await CasinoProfile.findOne({ userId: target.id });

       if (!profile) {
           return interaction.reply({
               content: "❌ Profil introuvable.",
               ephemeral: true
           });
       }

       profile.gifts = Math.max(0, profile.gifts - 1);

       await profile.save();

       const embed = new EmbedBuilder()
           .setColor("Red")
           .setTitle("🎁 Gift retiré")
           .setDescription(
               `${target} possède maintenant **${profile.gifts} Gifts**`
           );

       await interaction.reply({ embeds: [embed] });

       try {
           const logsGuild = interaction.client.guilds.cache.find(g =>
               g.channels.cache.has(LOGS_CASINO)
           );
           const logsChannel = logsGuild?.channels.cache.get(LOGS_CASINO);
           if (logsChannel) {
               await logsChannel.send({
                   content: `\`\`\`- Gift retiré.\nUtilisateur: ${target.username} (ID: ${target.id})\nModérateur: ${interaction.user.username} (ID: ${interaction.user.id})\nGifts restants: ${profile.gifts}\nAction: Gift débité. 🎁\`\`\``
               });
           }
       } catch {}
   }
};
