const {
SlashCommandBuilder,
EmbedBuilder,
ActionRowBuilder,
ButtonBuilder,
ButtonStyle
} = require("discord.js");

module.exports = {
data: new SlashCommandBuilder()
.setName("casinohelp")
.setDescription("Affiche l’aide du casino"),
    
async execute(interaction) {

    const pages = [
new EmbedBuilder()
            .setColor("Gold")
            .setTitle("🎰 Commandes globales casino (1/4)")
            .setDescription(`
• \`/casino\` : voir son profil casino
• \`/daily\` : avoir son quota quotidien
• \`/claim\` : récupérer son quota
• \`/gift\` : ouvrir un cadeau
• \`/rob\` : voler un utilisateur
• \`/pileface pile montant\` : parier côté pile
• \`/pileface face montant\` : parier côté face
• \`/blackjack\` : parier contre la banque
• \`/timers\` : voir ses compteurs
• \`/luck\` : voir les taux de chances
• \`/topcoins\` : voir le top casino
• \`/attack\` : tenter de frapper le coffre
• \`/donate\` : faire un don
• \`/bountystatus\` : voir une prime
• \`/bounty\` : poser une prime
• \`/bountylist\` : liste des primes
`),
new EmbedBuilder()
 .setColor("Blue")
 .setTitle("🛠️ Commandes admins casino (2/4)")
.setDescription(`
• \`/gw\` : créer un giveaway
• \`/greroll\` : retirer au sort
• \`/addcoins\` : ajouter des 💹
• \`/delcoins\` : retirer des 💹
• \`/addgifts\` : ajouter des cadeaux
• \`/delgifts\` : retirer des cadeaux
• \`/drop\` : lancer un drop
• \`/renew\` : recréer un salon
• \`/pingcasino\` : mentionner les joueurs
• \`/giveboosts\` : donner un boost
• \`/giverobs\` : donner des robs
`),
new EmbedBuilder()
.setColor("Red")
.setTitle("👑 Owners casino (3/4)")
.setDescription(`
• \`/gend\` : terminer un giveaway
• \`/panelcasino\` : afficher le panel casino
• \`/shop\` : panel boutique
• \`/resetcasino\` : réinitialiser le casino
• \`/blacklistcasino\` : bannir du casino
• \`/blacklist\` : voir les bannis
• \`/weeklycasino\` : relancer le GDC
• \`/wl\` : nouvelle gestion coins
• \`/wlremove\` : retirer gestion coins
• \`/wllist\` : voir la liste gestion coins
`),
new EmbedBuilder()
.setColor("Green")
.setTitle("🏆 Commandes GDC casino (4/4)")
.setDescription(`
• \`/clancreate\` : créer un clan
• \`/invite\` : inviter quelqu'un
• \`/leave\` : quitter son clan
• \`/transfer\` : transférer la propriété
• \`/deleteclan\` : supprimer son clan
• \`/topclans\` : classement des clans
• \`/myclan\` : voir son clan
• \`/statsclan\` : statistiques d'un clan
`)
 ];

let page = 0;

const row = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId("casino_prev")
                .setLabel("⬅️")
                .setStyle(ButtonStyle.Secondary),

            new ButtonBuilder()
                .setCustomId("casino_next")
                .setLabel("➡️")
                .setStyle(ButtonStyle.Secondary)
        );

    const msg = await interaction.reply({
        embeds: [pages[0]],
        components: [row],
        fetchReply: true
    });

    const collector = msg.createMessageComponentCollector({
        time: 300000
    });

    collector.on("collect", async i => {

        if (i.user.id !== interaction.user.id) {
            return i.reply({
                content: "❌ Vous ne pouvez pas utiliser ce menu.",
                ephemeral: true
            });
        }

        if (i.customId === "casino_next") {
            page++;
            if (page >= pages.length) page = 0;
        }

        if (i.customId === "casino_prev") {
            page--;
            if (page < 0) page = pages.length - 1;
        }

        await i.update({
            embeds: [pages[page]]
        });
    });

    collector.on("end", async () => {
        await msg.edit({
            components: []
        }).catch(() => {});
    });
}
 };
