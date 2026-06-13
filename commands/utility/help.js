const {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");

module.exports = {
    name: "help",

    async run(message) {
   
      const pages = [
    new EmbedBuilder()
      .setTitle("📖 Help • Page 1/6")
      .setColor(0x5865f2)
      .setDescription(`
👑 **OWNER BOT**

📋 Administration
\`+ownerlist\` ➜ Voir la liste des owners.
\`+setowner @user\` ➜ Ajouter un owner.
\`+removeowner @user\` ➜ Retirer un owner.

🛡️ Permissions
\`+whitelist\` ➜ Voir la whitelist.
\`+whitelist add @user\` ➜ Ajouter un whitelist.
\`+whitelist del @user\` ➜ Retirer un whitelist.

\`+wl\` ➜ Voir la WL.
\`+wl add @user\` ➜ Ajouter un WL.
\`+wl del @user\` ➜ Retirer un WL.

📢 Communication
\`+say\` ➜ Envoyer un message.
\`+embed\` ➜ Créer un embed.
\`+mp\` ➜ Envoyer un message privé.
\`+dm\` ➜ Envoyer le lien du serveur.
`),

    new EmbedBuilder()
      .setTitle("📖 Help • Page 2/6")
      .setColor(0x5865f2)
      .setDescription(`
👑 **OWNER BOT (Suite)**

🎫 Tickets
\`+panelticket\` ➜ Afficher le panel des tickets.
\`+autounclaim\` ➜ Retirer tous les claims des tickets.
\`+lbg\` ➜ Voir le classement des gestions tickets.

🎭 Rôles personnalisés
\`+panel\` ➜ Afficher le panel des rôles personnalisés.

📊 Classements
\`+lbvc\` ➜ Voir le classement vocal du jour.
\`+lbmg\` ➜ Voir le classement messages du jour.

🌐 Serveurs ennemis
\`+setenemy <id>\` ➜ Ajouter un serveur ennemi.
\`+enemydel <id>\` ➜ Retirer un serveur ennemi.

📝 Logs
\`+logsconfig\` ➜ Configurer les logs du serveur.

📢 Annonces
\`+weekly\` ➜ Ping everyone dans le salon règlement.
\`+stick <message>\` ➜ Afficher un message automatique en bas du salon.

📈 Statistiques
\`+shiiro\` ➜ Afficher les statistiques du serveur.

🎮 Jeux
\`+guesscita\` ➜ Deviner un philosophe grâce à une citation.
\`+guesscouleur\` ➜ Deviner le nom exact d'une couleur.
\`+guessbrand\` ➜ Deviner une marque à partir d'un logo.
\`+guessmusique\` ➜ Deviner une musique à partir d'un extrait audio.
\`+guessfilm\` ➜ Deviner un film à partir d'une image.
\`+serieguess\` ➜ Deviner une série à partir d'une image.
\`+guesscapitale\` ➜ Deviner la capitale d'un pays.
\`+guessflags\` ➜ Deviner un pays grâce à son drapeau.
\`+guesscountry\` ➜ Deviner un pays grâce à une description.
`),

    new EmbedBuilder()
      .setTitle("📖 Help • Page 3/6")
      .setColor(0x5865f2)
      .setDescription(`
🛡️ **WHITELIST**

👤 Gestion des utilisateurs

\`+bypass @user\`
➜ Autoriser un compte récent à rejoindre le serveur.

🔨 Sanctions

\`+ban @user [raison]\`
➜ Bannir un utilisateur et lui envoyer un message privé.

\`+unban <id>\`
➜ Débannir un utilisateur et lui envoyer un message privé.

🔓 Gestion Jail

\`+unjail @user\`
➜ Retirer un utilisateur de la prison (jail).

ℹ️ Informations

Les commandes Whitelist sont réservées aux utilisateurs
présents dans la liste Whitelist du bot.
`),

    new EmbedBuilder()
      .setTitle("📖 Help • Page 4/6")
      .setColor(0x5865f2)
      .setDescription(`
⭐ **WL**

🎉 Giveaways

\`+greroll <message_id>\`
➜ Relancer le tirage d'un giveaway.

\`+renew\`
➜ Recréer le salon giveaways.

💰 Économie

\`+addcoins @user <montant>\`
➜ Ajouter des coins à un utilisateur.

\`+delcoins @user <montant>\`
➜ Retirer des coins à un utilisateur.

\`+giveboost @user <durée>\`
➜ Donner un multiplicateur de coins à un utilisateur.

🎁 Cadeaux

\`+addgift @user <quantité>\`
➜ Ajouter des cadeaux à un utilisateur.

\`+delgift @user <quantité>\`
➜ Retirer des cadeaux à un utilisateur.

🎊 Événements

\`+drop\`
➜ Lancer un drop de récompenses.

🎰 Casino

\`+pincasino\`
➜ Mentionner tous les joueurs du casino.

ℹ️ Informations

Les commandes WL sont réservées aux utilisateurs
présents dans la liste WL du bot.
`),

    new EmbedBuilder()
      .setTitle("📖 Help • Page 5/6")
      .setColor(0x5865f2)
      .setDescription(`
🛠️ **MODÉRATEURS**

🎫 Gestion des tickets

\`+claim\`
➜ Prendre en charge un ticket.

\`+unclaim\`
➜ Ne plus prendre en charge un ticket.

\`+add @user\`
➜ Ajouter un utilisateur dans un ticket.

\`+remove @user\`
➜ Retirer un utilisateur d'un ticket.

\`+rename <nom>\`
➜ Renommer un ticket.

\`+close\`
➜ Fermer et supprimer un ticket.

⚖️ Modération

\`+warn @user [raison]\`
➜ Ajouter un avertissement à un utilisateur et lui envoyer un MP.

\`+delwarn @user\`
➜ Retirer un avertissement.

\`+warnlist @user\`
➜ Afficher la liste des avertissements d'un utilisateur.

\`+jail @user [durée]\`
➜ Mettre un utilisateur en prison (jail).

ℹ️ Informations

Les commandes Modérateurs sont accessibles
uniquement aux rôles configurés avec :

\`+moderole add @role\`
`),

    new EmbedBuilder()
      .setTitle("📖 Help • Page 6/6")
      .setColor(0x5865f2)
      .setDescription(`
🎰 **CASINO OWNER**

🛒 Gestion du casino

\`+shop\`
➜ Afficher le panel du shop casino.

\`+panelcasino\`
➜ Afficher le panel de création de profil casino.

\`+resetcasino\`
➜ Réinitialiser entièrement le système casino.

🎉 Giveaways Casino

\`+gend\`
➜ Mettre fin à un giveaway.

\`+weeklycasino\`
➜ Relancer une GDC (Giveaway de Coins).

🚫 Blacklist Casino

\`+blacklistcasino @user\`
➜ Bannir un utilisateur du casino.

\`+blacklist\`
➜ Afficher la liste des utilisateurs bannis du casino.

👑 Administration Casino

\`+wl @user\`
➜ Ajouter un utilisateur à la liste des administrateurs casino.

\`+wlremove @user\`
➜ Retirer un administrateur casino.

\`+wllist\`
➜ Afficher la liste des administrateurs casino.

ℹ️ Informations

Les commandes Casino Owner sont réservées
aux administrateurs du système casino.
`),
  ];

  let page = 0;

  const row = () =>
    new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("help_prev")
        .setLabel("◀")
        .setStyle(ButtonStyle.Secondary),

      new ButtonBuilder()
        .setCustomId("help_next")
        .setLabel("▶")
        .setStyle(ButtonStyle.Secondary)
    );

  const msg = await message.reply({
    embeds: [pages[0]],
    components: [row()],
  });

  const collector = msg.createMessageComponentCollector({
    time: 300000,
  });

  collector.on("collect", async (i) => {

    if (i.user.id !== message.author.id) {
      return i.reply({
        content: "❌ Ce menu ne t'appartient pas.",
        ephemeral: true,
      });
    }

    if (i.customId === "help_next") {
      page = (page + 1) % pages.length;
    }

    if (i.customId === "help_prev") {
      page = (page - 1 + pages.length) % pages.length;
    }

    await i.update({
      embeds: [pages[page]],
      components: [row()],
    });
  });

  collector.on("end", async () => {
    await msg.edit({
      components: [],
    }).catch(() => {});
  });

  return;
}
  };
