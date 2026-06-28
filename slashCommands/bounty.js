const {
   SlashCommandBuilder,
   EmbedBuilder,
   ActionRowBuilder,
   ButtonBuilder,
   ButtonStyle
} = require("discord.js");

const CasinoProfile = require("../models/CasinoProfile");
const Clan = require("../models/Clan");

const BOUNTY_CHANNEL = "1519247019246616598";
const LOGS_CASINO = "1520766436388245585";

module.exports = {
   data: new SlashCommandBuilder()
       .setName("bounty")
       .setDescription("Pose une prime sur un membre.")
       .addUserOption(option =>
           option.setName("cible")
               .setDescription("Le membre sur qui poser la prime.")
               .setRequired(true)
       )
       .addIntegerOption(option =>
           option.setName("montant")
               .setDescription("Montant de la prime en yens.")
               .setMinValue(1000)
               .setRequired(true)
       ),

   async execute(interaction) {
       const target = interaction.options.getUser("cible");
       const amount = interaction.options.getInteger("montant");

       // ✅ Pas de prime sur soi-même
       if (target.id === interaction.user.id) {
           return interaction.reply({
               content: "❌ Tu ne peux pas poser une prime sur toi-même.",
               ephemeral: true
           });
       }

       // ✅ Pas de prime sur un bot
       if (target.bot) {
           return interaction.reply({
               content: "❌ Tu ne peux pas poser une prime sur un bot.",
               ephemeral: true
           });
       }

       // ✅ Vérification profil poseur
       const poster = await CasinoProfile.findOne({ userId: interaction.user.id });
       if (!poster || poster.yens < amount) {
           return interaction.reply({
               content: `❌ Solde insuffisant. Tu as **${(poster?.yens ?? 0).toLocaleString()} ¥** et la prime coûte **${amount.toLocaleString()} ¥**.`,
               ephemeral: true
           });
       }

       // ✅ Prélèvement immédiat
       poster.yens -= amount;
       await poster.save();

       // ✅ Envoi dans le salon bounty
       const channel = interaction.guild.channels.cache.get(BOUNTY_CHANNEL);
       if (!channel) {
           return interaction.reply({
               content: "❌ Salon de prime introuvable.",
               ephemeral: true
           });
       }

       const embed = new EmbedBuilder()
           .setColor("DarkRed")
           .setTitle("🎯 PRIME ACTIVE")
           .setDescription(`Une prime a été posée sur **${target}** !`)
           .addFields(
               { name: "🎯 Cible", value: `${target} (ID: ${target.id})`, inline: true },
               { name: "💴 Récompense", value: `\`${amount.toLocaleString()} ¥\``, inline: true },
               { name: "📌 Posée par", value: `${interaction.user}`, inline: true }
           )
           .setThumbnail(target.displayAvatarURL({ dynamic: true }))
           .setFooter({ text: "Shiiro Casino • Bounty", iconURL: interaction.guild.iconURL() })
           .setTimestamp();

       const row = new ActionRowBuilder().addComponents(
           new ButtonBuilder()
               .setCustomId(`bounty_claim_${target.id}_${interaction.user.id}_${amount}`)
               .setLabel("🏆 Réclamer la prime")
               .setStyle(ButtonStyle.Danger)
       );

       const msg = await channel.send({ embeds: [embed], components: [row] });

       await interaction.reply({
           content: `✅ Prime de **${amount.toLocaleString()} ¥** posée sur ${target} !\n**${amount.toLocaleString()} ¥** ont été prélevés de ton compte.`,
           ephemeral: true
       });

       // ✅ Logs
       try {
           const logsGuild = interaction.client.guilds.cache.find(g =>
               g.channels.cache.has(LOGS_CASINO)
           );
           const logsChannel = logsGuild?.channels.cache.get(LOGS_CASINO);
           if (logsChannel) {
               await logsChannel.send({
                   content:
                       "```diff\n" +
                       "- Prime posée.\n" +
                       `Poseur: ${interaction.user.username} (ID: ${interaction.user.id})\n` +
                       `Cible: ${target.username} (ID: ${target.id})\n` +
                       `Montant: ${amount.toLocaleString()} ¥\n` +
                       "Action: Yens prélevés. 🎯\n" +
                       "```"
               });
           }
       } catch (err) {
           console.error("Erreur logs bounty :", err);
       }
   }
};
