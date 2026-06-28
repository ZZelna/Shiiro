const {
   SlashCommandBuilder,
   EmbedBuilder
} = require("discord.js");

const CasinoProfile = require("../models/CasinoProfile");

const allowedRoles = [
   "1506674274826584284",
   "1506709088451690708"
];

const LOGS_CASINO = "1520766436388245585";

module.exports = {
   data: new SlashCommandBuilder()
       .setName("addcoins")
       .setDescription("Ajouter des yens à un joueur")
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

       let profile = await CasinoProfile.findOne({ userId: user.id });

       if (!profile) {
           profile = await CasinoProfile.create({
               userId: user.id,
               yens: 0,
               gifts: 0
           });
       }

       profile.yens += amount;

       await profile.save();

       const updateClanYens = require("../utils/updateClanYens");
       await updateClanYens(user.id);

       const embed = new EmbedBuilder()
           .setColor("Green")
           .setTitle("💴 Yens ajoutés")
           .setDescription(
               `✅ ${user} reçoit **${amount.toLocaleString()} ¥**`
           );

       await interaction.reply({ embeds: [embed] });

       try {
           const logsGuild = interaction.client.guilds.cache.find(g =>
               g.channels.cache.has(LOGS_CASINO)
           );
           const logsChannel = logsGuild?.channels.cache.get(LOGS_CASINO);
           if (logsChannel) {
               await logsChannel.send({
                   content: `\`\`\`- Yens ajoutés.\nUtilisateur: ${user.username} (ID: ${user.id})\nModérateur: ${interaction.user.username} (ID: ${interaction.user.id})\nMontant: ${amount.toLocaleString()} ¥\nAction: Yens crédités. 💴\`\`\``
               });
           }
       } catch {}
   }
};
