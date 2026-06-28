const {
   SlashCommandBuilder,
   EmbedBuilder
} = require("discord.js");

const CasinoProfile = require("../models/CasinoProfile");
const updateClanYens = require("../systems/updateClanYens");

const allowedRoles = [
   "1506674274826584284",
   "1506709088451690708"
];

const LOGS_CASINO = "1520766436388245585";

module.exports = {
   data: new SlashCommandBuilder()
       .setName("delcoins")
       .setDescription("Retirer des yens à un joueur")
       .addStringOption(option =>
           option
               .setName("id")
               .setDescription("ID Discord du joueur")
               .setRequired(true)
       )
       .addIntegerOption(option =>
           option
               .setName("montant")
               .setDescription("Montant")
               .setRequired(true)
       ),

   async execute(interaction) {

       if (
           !interaction.member.roles.cache.some(
               role => allowedRoles.includes(role.id)
           )
       ) {
           return interaction.reply({
               content: "❌ Permission refusée.",
               ephemeral: true
           });
       }

       const userId = interaction.options.getString("id");

       let user;

       try {
           user = await interaction.client.users.fetch(userId);
       } catch {
           return interaction.reply({
               content: "❌ ID Discord invalide ou utilisateur introuvable.",
               ephemeral: true
           });
       }

       const amount = interaction.options.getInteger("montant");

       const profile = await CasinoProfile.findOne({ userId: user.id });

       if (!profile) {
           return interaction.reply({
               content: "❌ Profil casino introuvable.",
               ephemeral: true
           });
       }

       profile.yens -= amount;
       if (profile.yens < 0) profile.yens = 0;

       await profile.save();

       try {
           await updateClanYens(user.id, -amount);
       } catch (err) {
           console.error("[CLAN ERROR DELCOINS]", err);
       }

       const embed = new EmbedBuilder()
           .setColor("Red")
           .setTitle("💴 Yens retirés")
           .setDescription(
               `❌ ${amount.toLocaleString()} ¥ retirés à ${user}`
           );

       await interaction.reply({ embeds: [embed] });

       try {
           const logsGuild = interaction.client.guilds.cache.find(g =>
               g.channels.cache.has(LOGS_CASINO)
           );
           const logsChannel = logsGuild?.channels.cache.get(LOGS_CASINO);
           if (logsChannel) {
               await logsChannel.send({
                   content: `\`\`\`- Yens retirés.\nUtilisateur: ${user.username} (ID: ${user.id})\nModérateur: ${interaction.user.username} (ID: ${interaction.user.id})\nMontant: ${amount.toLocaleString()} ¥\nSolde actuel: ${profile.yens.toLocaleString()} ¥\nAction: Yens débités. 💴\`\`\``
               });
           }
       } catch {}
   }
};
