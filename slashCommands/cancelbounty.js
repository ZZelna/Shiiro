const {
   SlashCommandBuilder
} = require("discord.js");

const CasinoProfile = require("../models/CasinoProfile");
const Bounty = require("../models/Bounty");

const LOGS_CASINO = "1520766436388245585";

module.exports = {
   data: new SlashCommandBuilder()
       .setName("cancelbounty")
       .setDescription("Annule ta prime active sur un membre.")
       .addUserOption(option =>
           option.setName("cible")
               .setDescription("Le membre dont tu veux annuler la prime.")
               .setRequired(true)
       ),

   async execute(interaction) {
       const target = interaction.options.getUser("cible");

       const bounty = await Bounty.findOne({ targetId: target.id });

       // ✅ Prime inexistante
       if (!bounty) {
           return interaction.reply({
               content: `❌ Aucune prime active sur ${target}.`,
               ephemeral: true
           });
       }

       // ✅ Seul le poseur peut annuler
       if (bounty.posterId !== interaction.user.id) {
           return interaction.reply({
               content: "❌ Tu n'es pas à l'origine de cette prime.",
               ephemeral: true
           });
       }

       // ✅ Remboursement
       const poster = await CasinoProfile.findOne({ userId: interaction.user.id });
       if (poster) {
           poster.yens += bounty.amount;
           await poster.save();
       }

       // ✅ Mise à jour de l'embed
       try {
           const bountyChannel = interaction.guild.channels.cache.get("1519247019246616598");
           if (bountyChannel && bounty.messageId) {
               const bountyMsg = await bountyChannel.messages.fetch(bounty.messageId).catch(() => null);
               if (bountyMsg) await bountyMsg.delete().catch(() => null);
           }
       } catch (err) {
           console.error("Erreur suppression message bounty :", err);
       }

       // ✅ Suppression en DB
       await Bounty.deleteOne({ targetId: target.id });

       await interaction.reply({
           content: `✅ Prime annulée sur ${target}. **${bounty.amount.toLocaleString()} ¥** remboursés sur ton compte.`,
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
                       "- Prime annulée.\n" +
                       `Poseur: ${interaction.user.username} (ID: ${interaction.user.id})\n` +
                       `Cible: ${target.username} (ID: ${target.id})\n` +
                       `Montant remboursé: ${bounty.amount.toLocaleString()} ¥\n` +
                       "Action: Prime supprimée. ❌\n" +
                       "```"
               });
           }
       } catch (err) {
           console.error("Erreur logs cancelbounty :", err);
       }
   }
};
