const {
   SlashCommandBuilder,
   EmbedBuilder,
   ActionRowBuilder,
   ButtonBuilder,
   ButtonStyle
} = require("discord.js");

const CasinoProfile = require("../models/CasinoProfile");

const ALLOWED_ROLE = "1506674274826584284";

const SHOP_ITEMS = [
   {
       id: "role_perso",
       label: "👀 Rôle Perso",
       roleId: "1520898457580081233",
       price: 2_000_000,
       desc: "Crée ton propre rôle custom."
   },
   {
       id: "perm_pic",
       label: "🌆 Perm Photo",
       roleId: "1519633537156907088",
       price: 50_000,
       desc: "Photo de profil animée."
   },
   {
       id: "perm_banner",
       label: "🌃 Perm Bannière",
       roleId: "1519633572850438225",
       price: 50_000,
       desc: "Bannière de profil."
   },
   {
       id: "perm_voc_chat",
       label: "🎙️ Perm Voc & Chat",
       roleId: "1519383713014878279",
       price: 50_000,
       desc: "Accès vocal & chat privé."
   },
   {
       id: "deco_profil",
       label: "🎆 Déco Profil",
       roleId: "1519383383493312532",
       price: 15_000_000,
       desc: "Style unique sur ton profil."
   },
   {
       id: "nitro_boost",
       label: "🔮 Nitro Boost",
       roleId: "1519383355765035130",
       price: 20_000_000,
       desc: "Avantages Nitro Boost."
   }
];

module.exports = {
   data: new SlashCommandBuilder()
       .setName("shop")
       .setDescription("Ouvre la boutique du serveur."),

   SHOP_ITEMS,

   async execute(interaction) {

       // ✅ Vérification rôle
       const member = await interaction.guild.members.fetch(interaction.user.id);
       if (!member.roles.cache.has(ALLOWED_ROLE)) {
           return interaction.reply({
               content: "❌ Tu n'as pas la permission d'utiliser la boutique.",
               ephemeral: true
           });
       }

       const profile = await CasinoProfile.findOne({ userId: interaction.user.id });
       const balance = profile?.yens ?? 0;

       const embed = new EmbedBuilder()
           .setColor("#0064c8")
           .setTitle("🏪 Boutique Shiiro")
           .setDescription(`💴 **Ton solde :** \`${balance.toLocaleString()} ¥\`\n\nClique sur un article pour l'acheter.`)
           .addFields(
               SHOP_ITEMS.map(item => ({
                   name: item.label,
                   value: `${item.desc}\n**Prix :** \`${item.price.toLocaleString()} ¥\``,
                   inline: true
               }))
           )
           .setFooter({ text: "Shiiro Casino • Boutique", iconURL: interaction.guild.iconURL() })
           .setTimestamp();

       // Ligne 1 : 3 premiers articles
       const row1 = new ActionRowBuilder().addComponents(
           SHOP_ITEMS.slice(0, 3).map(item =>
               new ButtonBuilder()
                   .setCustomId(`shop_buy_${item.id}`)
                   .setLabel(item.label)
                   .setStyle(ButtonStyle.Primary)
           )
       );

       // Ligne 2 : 3 derniers articles
       const row2 = new ActionRowBuilder().addComponents(
           SHOP_ITEMS.slice(3, 6).map(item =>
               new ButtonBuilder()
                   .setCustomId(`shop_buy_${item.id}`)
                   .setLabel(item.label)
                   .setStyle(ButtonStyle.Primary)
           )
       );

       await interaction.reply({
           embeds: [embed],
           components: [row1, row2],
            });
   }
};
