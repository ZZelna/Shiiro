const {
 SlashCommandBuilder,
 EmbedBuilder
} = require("discord.js");

const CasinoProfile = require("../models/CasinoProfile");
const Coffre = require("../models/Coffre");

const COOLDOWN = 30 * 60 * 1000;
const MAX_HITS = 10000;
const TOTAL_YENS = 5000000;

function buildProgressBar(current, max, length = 20) {
 const filled = Math.round((current / max) * length);
 const empty = length - filled;
 return "🟥".repeat(filled) + "⬛".repeat(empty);
}

module.exports = {
 data: new SlashCommandBuilder()
   .setName("attack")
   .setDescription("Attaque le coffre pour gagner des yens !"),

 async execute(interaction) {
   const user = await CasinoProfile.findOne({ userId: interaction.user.id });

   if (!user) {
     return interaction.reply({
       content: "❌ Tu n'as pas de profil casino. Utilise `/casino` pour en créer un.",
       ephemeral: true
     });
   }

   let coffre = await Coffre.findOne();

   if (!coffre || coffre.destroyed) {
     return interaction.reply({
       content: "❌ Il n'y a pas de coffre actif. Attends qu'un admin en lance un.",
       ephemeral: true
     });
   }

   // Cooldown
   const now = Date.now();
   const lastAttack = coffre.participants.get(interaction.user.id)?.lastAttack ?? 0;

   if (now - lastAttack < COOLDOWN) {
     const remaining = COOLDOWN - (now - lastAttack);
     const minutes = Math.floor(remaining / 60000);
     const seconds = Math.floor((remaining % 60000) / 1000);
     return interaction.reply({
       content: `⏳ Tu dois attendre encore **${minutes}m ${seconds}s** avant d'attaquer à nouveau.`,
       ephemeral: true
     });
   }

   // Frappe
   const participant = coffre.participants.get(interaction.user.id) ?? { hits: 0, lastAttack: 0 };
   participant.hits += 1;
   participant.lastAttack = now;
   coffre.participants.set(interaction.user.id, participant);
   coffre.totalHits += 1;
   coffre.markModified("participants");

   const percent = Math.min((coffre.totalHits / MAX_HITS) * 100, 100).toFixed(1);
   const progressBar = buildProgressBar(coffre.totalHits, MAX_HITS);

   // Coffre détruit
   if (coffre.totalHits >= MAX_HITS) {
     coffre.destroyed = true;
     await coffre.save();

     // Répartition des yens
     const rewards = [];
     for (const [userId, data] of coffre.participants) {
       const share = Math.floor((data.hits / MAX_HITS) * TOTAL_YENS);
       const profile = await CasinoProfile.findOne({ userId });
       if (profile) {
         profile.yens += share;
         await profile.save();
         rewards.push(`<@${userId}> — **${data.hits} frappes** → **${share} Yens**`);
       }
     }

     return interaction.reply({
       embeds: [
         new EmbedBuilder()
           .setColor("Gold")
           .setTitle("💥 Coffre détruit !")
           .setDescription(
             `Le coffre a été détruit après **${MAX_HITS} frappes** !\n\n` +
             `**Répartition des ${TOTAL_YENS.toLocaleString()} Yens :**\n` +
             rewards.join("\n")
           )
       ]
     });
   }

   await coffre.save();

   return interaction.reply({
     embeds: [
       new EmbedBuilder()
         .setColor("Orange")
         .setTitle("⚔️ Attaque !")
         .setDescription(
           `${interaction.user} frappe le coffre !\n\n` +
           `${progressBar}\n` +
           `**${coffre.totalHits} / ${MAX_HITS} frappes** (${percent}%)\n\n` +
           `Tu as frappé **${participant.hits} fois** au total.`
         )
     ]
   });
 }
};
