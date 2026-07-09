const {
 SlashCommandBuilder,
 EmbedBuilder,
 ActionRowBuilder,
 ButtonBuilder,
 ButtonStyle
} = require("discord.js");

const CasinoProfile = require("../models/CasinoProfile");

const DAILY_LIMIT = 500000;

function getCardValue(card) {
 if (["J", "Q", "K"].includes(card.value)) return 10;
 if (card.value === "A") return 11;
 return parseInt(card.value);
}

function getHandValue(hand) {
 let total = hand.reduce((sum, card) => sum + getCardValue(card), 0);
 let aces = hand.filter(c => c.value === "A").length;
 while (total > 21 && aces > 0) {
   total -= 10;
   aces--;
 }
 return total;
}

function drawCard(deck) {
 return deck.splice(Math.floor(Math.random() * deck.length), 1)[0];
}

function buildDeck() {
 const suits = ["♠", "♥", "♦", "♣"];
 const values = ["2","3","4","5","6","7","8","9","10","J","Q","K","A"];
 return suits.flatMap(suit => values.map(value => ({ suit, value })));
}

function handToString(hand) {
 return hand.map(c => `${c.value}${c.suit}`).join("  ");
}

module.exports = {
 data: new SlashCommandBuilder()
   .setName("blackjack")
   .setDescription("Joue au blackjack contre le dealer.")
   .addIntegerOption(option =>
     option.setName("mise")
       .setDescription("Montant à parier.")
       .setRequired(true)
       .setMinValue(1)
   ),

 async execute(interaction) {
  const ALLOWED_CHANNEL = "1523677940750225508";

    if (interaction.channelId !== ALLOWED_CHANNEL) {

        return interaction.reply({

            content: `❌ Cette commande casino est uniquement utilisable dans <#1523677940750225508>.`,

            ephemeral: true

        });

    }
 const bet = interaction.options.getInteger("mise");

   const user = await CasinoProfile.findOne({ userId: interaction.user.id });

   if (!user) {
     return interaction.reply({
       content: "❌ Tu n'as pas de profil casino. Utilise `/casino` pour en créer un.",
       ephemeral: true
     });
   }

   if (user.yens < bet) {
     return interaction.reply({
       content: `❌ Tu n'as pas assez de yens. Tu as **${user.yens} Yens**.`,
       ephemeral: true
     });
   }

   // Reset compteur journalier
   const now = new Date();
   const lastDaily = user.lastDaily ? new Date(user.lastDaily) : null;
   const sameDay = lastDaily &&
     lastDaily.getDate() === now.getDate() &&
     lastDaily.getMonth() === now.getMonth() &&
     lastDaily.getFullYear() === now.getFullYear();

   if (!sameDay) {
     user.lastDaily = now;
     user.dailyBet = 0;
   }

   const alreadyBet = user.dailyBet ?? 0;

   if (alreadyBet + bet > DAILY_LIMIT) {
     const remaining = DAILY_LIMIT - alreadyBet;
     return interaction.reply({
       content: `❌ Limite journalière atteinte. Il te reste **${remaining} Yens** à parier aujourd'hui.`,
       ephemeral: true
     });
   }

   // Jeu
   const deck = buildDeck();
   const playerHand = [drawCard(deck), drawCard(deck)];
   const dealerHand = [drawCard(deck), drawCard(deck)];

   const playerValue = getHandValue(playerHand);

   // Blackjack immédiat
   if (playerValue === 21) {
     const winnings = Math.floor(bet * 1.5);
     user.yens += winnings;
     user.dailyBet = alreadyBet + bet;
     await user.save();

     return interaction.reply({
       embeds: [
         new EmbedBuilder()
           .setColor("Gold")
           .setTitle("🃏 Blackjack !")
           .setDescription(
             `🧑 Ta main : ${handToString(playerHand)} — **${playerValue}**\n\n` +
             `🎉 Blackjack ! Tu gagnes **${winnings} Yens** !\n` +
             `💴 Solde : **${user.yens} Yens**`
           )
       ]
     });
   }

   const row = new ActionRowBuilder().addComponents(
     new ButtonBuilder()
       .setCustomId("bj_hit")
       .setLabel("🃏 Tirer")
       .setStyle(ButtonStyle.Primary),
     new ButtonBuilder()
       .setCustomId("bj_stand")
       .setLabel("✋ Rester")
       .setStyle(ButtonStyle.Secondary)
   );

   const msg = await interaction.reply({
     embeds: [
       new EmbedBuilder()
         .setColor("Blue")
         .setTitle("🃏 Blackjack")
         .setDescription(
           `🧑 Ta main : ${handToString(playerHand)} — **${playerValue}**\n` +
           `🏦 Dealer : ${handToString([dealerHand[0]])} ?\n\n` +
           `💴 Mise : **${bet} Yens**`
         )
     ],
     components: [row],
     fetchReply: true
   });

   const collector = msg.createMessageComponentCollector({
     filter: i => i.user.id === interaction.user.id,
     time: 60000
   });

   collector.on("collect", async (i) => {
     if (i.customId === "bj_hit") {
       playerHand.push(drawCard(deck));
       const newValue = getHandValue(playerHand);

       if (newValue > 21) {
         collector.stop("bust");
         user.yens -= bet;
         user.dailyBet = alreadyBet + bet;
         await user.save();

         return i.update({
           embeds: [
             new EmbedBuilder()
               .setColor("Red")
               .setTitle("💥 Bust !")
               .setDescription(
                 `🧑 Ta main : ${handToString(playerHand)} — **${newValue}**\n\n` +
                 `Tu as dépassé 21, tu perds **${bet} Yens** !\n` +
                 `💴 Solde : **${user.yens} Yens**`
               )
           ],
           components: []
         });
       }

       if (newValue === 21) {
         collector.stop("stand");
         return i.update({
           embeds: [
             new EmbedBuilder()
               .setColor("Blue")
               .setTitle("🃏 Blackjack")
               .setDescription(
                 `🧑 Ta main : ${handToString(playerHand)} — **${newValue}**\n` +
                 `🏦 Dealer : ${handToString([dealerHand[0]])} ?\n\n` +
                 `💴 Mise : **${bet} Yens**`
               )
           ],
           components: []
         }).then(() => resolveGame(i, playerHand, dealerHand, deck, bet, user, alreadyBet));
       }

       await i.update({
         embeds: [
           new EmbedBuilder()
             .setColor("Blue")
             .setTitle("🃏 Blackjack")
             .setDescription(
               `🧑 Ta main : ${handToString(playerHand)} — **${newValue}**\n` +
               `🏦 Dealer : ${handToString([dealerHand[0]])} ?\n\n` +
               `💴 Mise : **${bet} Yens**`
             )
         ],
         components: [row]
       });
     }

     if (i.customId === "bj_stand") {
       collector.stop("stand");
       await i.update({ components: [] });
       await resolveGame(i, playerHand, dealerHand, deck, bet, user, alreadyBet);
     }
   });

   collector.on("end", async (collected, reason) => {
     if (reason === "time") {
       await msg.edit({ components: [] }).catch(() => {});
     }
   });
 }
};

async function resolveGame(i, playerHand, dealerHand, deck, bet, user, alreadyBet) {
 while (getHandValue(dealerHand) < 17) {
   dealerHand.push(drawCard(deck));
 }

 const playerValue = getHandValue(playerHand);
 const dealerValue = getHandValue(dealerHand);

 let color, title, result;

 if (dealerValue > 21 || playerValue > dealerValue) {
   user.yens += bet;
   color = "Green";
   title = "✅ Gagné !";
   result = `Tu gagnes **${bet} Yens** !`;
 } else if (playerValue === dealerValue) {
   color = "Yellow";
   title = "🤝 Égalité !";
   result = "La mise est remboursée.";
 } else {
   user.yens -= bet;
   color = "Red";
   title = "❌ Perdu !";
   result = `Tu perds **${bet} Yens** !`;
 }

 user.dailyBet = alreadyBet + bet;
 await user.save();

 await i.followUp({
   embeds: [
     new EmbedBuilder()
       .setColor(color)
       .setTitle(`🃏 ${title}`)
       .setDescription(
         `🧑 Ta main : ${handToString(playerHand)} — **${playerValue}**\n` +
         `🏦 Dealer : ${handToString(dealerHand)} — **${dealerValue}**\n\n` +
         `${result}\n💴 Solde : **${user.yens} Yens**`
       )
   ]
 });
}
