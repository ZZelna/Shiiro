const {
 SlashCommandBuilder,
 EmbedBuilder,
 ActionRowBuilder,
 ButtonBuilder,
 ButtonStyle
} = require("discord.js");

const CasinoProfile = require("../models/CasinoProfile");

const allowedRoles = ["1506709088451690708", "1506674274826584284"];
const LOGS_CASINO = "1520766436388245585";

module.exports = {
 data: new SlashCommandBuilder()
   .setName("drop")
   .setDescription("Lance un drop."),

 async execute(interaction) {
   const hasRole = interaction.member.roles.cache.some(r => allowedRoles.includes(r.id));

   if (!hasRole) {
     return interaction.reply({
       content: "❌ Tu n'as pas la permission d'utiliser cette commande.",
       ephemeral: true
     });
   }

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
         content: "❌ Tu n'as pas de profil casino. Utilise `/casino` pour en créer un.",
         ephemeral: true
       });
       return;
     }

     collector.stop("claimed");

     const rewards = [
       () => {
         const value = Math.floor(Math.random() * 4000) + 1000;
         user.yens += value;
         return { label: `💴 ${value} Yens`, type: "yens" };
       },
       () => {
         user.gifts += 1;
         return { label: "🎁 1 Gift", type: "gift" };
       },
       () => {
         user.boostMultiplier = 2;
         user.boostEnd = new Date(Date.now() + 60 * 60 * 1000);
         return { label: "💰 1 Doubleur de Yens (1h)", type: "boost" };
       }
     ];

     const reward = rewards[Math.floor(Math.random() * rewards.length)]();

     await user.save();

     button.setDisabled(true);

     await i.update({
       embeds: [
         new EmbedBuilder()
           .setColor("Green")
           .setTitle("🎉 Drop récupéré")
           .setDescription(`${i.user} a remporté ${reward.label} !`)
       ],
       components: [new ActionRowBuilder().addComponents(button)]
     });

     try {
       const logsGuild = interaction.client.guilds.cache.find(g =>
         g.channels.cache.has(LOGS_CASINO)
       );
       const logsChannel = logsGuild?.channels.cache.get(LOGS_CASINO);
       if (logsChannel) {
         await logsChannel.send({
           content: [
             `- Drop réclamé.`,
             `Utilisateur: ${i.user.username} (ID: ${i.user.id})`,
             `Récompense: ${reward.label}`,
             `Lancé par: ${interaction.user.username} (ID: ${interaction.user.id})`
           ].join("\n")
         });
       }
     } catch {}

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

     try {
       const logsGuild = interaction.client.guilds.cache.find(g =>
         g.channels.cache.has(LOGS_CASINO)
       );
       const logsChannel = logsGuild?.channels.cache.get(LOGS_CASINO);
       if (logsChannel) {
         await logsChannel.send({
           content: [
             `- Drop expiré.`,
             `Lancé par: ${interaction.user.username} (ID: ${interaction.user.id})`,
             `Action: Personne n'a réclamé le drop.`
           ].join("\n")
         });
       }
     } catch {}

   });
 }
};
