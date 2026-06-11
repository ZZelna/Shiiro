const {
  Client,
  GatewayIntentBits,
  Partials,
  EmbedBuilder,
  ActivityType,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} = require("discord.js");
const fs = require("fs");
const path = require("path");

// ─── Config ───────────────────────────────────────────────────────────────────
const CONFIG_PATH = path.join(__dirname, "config.json");

function loadConfig() {
  if (!fs.existsSync(CONFIG_PATH)) {

    const defaultCfg = {
      prefix: "+",
      owner_ids: [],
      whitelist: [],
      giveaway_whitelist: [],
      moderator_roles: [],
      log_channel_id: null,
      custom_roles: {}
    };

    saveConfig(defaultCfg);
    return defaultCfg;
  }

  return JSON.parse(
    fs.readFileSync(CONFIG_PATH, "utf-8")
  );
}

function saveConfig(config) {
  fs.writeFileSync(
    CONFIG_PATH,
    JSON.stringify(config, null, 2),
    "utf-8"
  );
}

function getCustomRoles() {
  const cfg = loadConfig();

  if (!cfg.custom_roles) {
    cfg.custom_roles = {};
    saveConfig(cfg);
  }

  return cfg.custom_roles;
}
function addCustomRole(commandName, roleId, ownerId) {
  const cfg = loadConfig();

  if (!cfg.custom_roles)
    cfg.custom_roles = {};

  cfg.custom_roles[commandName.toLowerCase()] = {
    role_id: roleId,
    owner_id: ownerId
  };

  saveConfig(cfg);
}

function addCustomRole(commandName, roleId, ownerId) {
  const cfg = loadConfig();

  if (!cfg.custom_roles)
    cfg.custom_roles = {};

  cfg.custom_roles[commandName.toLowerCase()] = {
    role_id: roleId,
    owner_id: ownerId
  };

  saveConfig(cfg);
}

function removeCustomRole(commandName) {
  const cfg = loadConfig();

  if (!cfg.custom_roles)
    return false;

  delete cfg.custom_roles[commandName.toLowerCase()];

  saveConfig(cfg);

  return true;
}

function getCustomRole(commandName) {
  const cfg = loadConfig();

  if (!cfg.custom_roles)
    return null;

  return cfg.custom_roles[commandName.toLowerCase()];
}

// ─── Permissions ──────────────────────────────────────

function isOwner(userId) {
  return loadConfig().owner_ids.includes(userId);
}

// Whitelist Modération
function isWhitelisted(userId) {
  const cfg = loadConfig();

  return (
    cfg.owner_ids.includes(userId) ||
    cfg.whitelist.includes(userId)
  );
}

// Whitelist Casino / Giveaway
function isCasinoWhitelisted(userId) {
  const cfg = loadConfig();

  return (
    cfg.owner_ids.includes(userId) ||
    cfg.giveaway_whitelist.includes(userId)
  );
}


// ─── Giveaways ─────────────────────────────────────────

const GIVEAWAYS_PATH = path.join(__dirname, "giveaways.json");

function loadGiveaways() {
  if (!fs.existsSync(GIVEAWAYS_PATH)) {
    fs.writeFileSync(GIVEAWAYS_PATH, "[]");
  }

  return JSON.parse(
    fs.readFileSync(GIVEAWAYS_PATH, "utf8")
  );
}

function saveGiveaways(data) {
  fs.writeFileSync(
    GIVEAWAYS_PATH,
    JSON.stringify(data, null, 2)
  );
}

function saveGiveaway(messageId, data) {
  const giveaways = loadGiveaways();

  giveaways.push({
    messageId,
    ...data
  });

  saveGiveaways(giveaways);
}

// ─── Bot setup ────────────────────────────────────────────────────────────────
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
  partials: [Partials.Message, Partials.Channel],
});


// ─── Embed helpers ────────────────────────────────────────────────────────────
function embedSuccess(msg) {
  return new EmbedBuilder()
    .setDescription(`✅ ${msg}`)
    .setColor(0x57f287)
    .setTimestamp();
}

function embedError(msg) {
  return new EmbedBuilder()
    .setDescription(`❌ ${msg}`)
    .setColor(0xed4245)
    .setTimestamp();
}

function embedWarn(msg) {
  return new EmbedBuilder()
    .setDescription(`⚠️ ${msg}`)
    .setColor(0xfee75c)
    .setTimestamp();
}

function embedInfo(msg) {
  return new EmbedBuilder()
    .setDescription(`ℹ️ ${msg}`)
    .setColor(0x5865f2)
    .setTimestamp();
}

// ─── Log helper ───────────────────────────────────────────────────────────────
async function logAction(guild, action, executorId, target, details = "") {
  const cfg = loadConfig();
  if (!cfg.log_channel_id) return;
  const channel = guild.channels.cache.get(cfg.log_channel_id);
  if (!channel) return;

  const embed = new EmbedBuilder()
    .setTitle(`📋 Log — ${action}`)
    .setColor(0x5865f2)
    .setTimestamp()
    .addFields(
      { name: "Exécuté par", value: `<@${executorId}>`, inline: true },
      { name: "Cible", value: target, inline: true }
    );
  if (details) embed.setDescription(details);
  await channel.send({ embeds: [embed] });
}

// ─── Prefix helper ────────────────────────────────────────────────────────────
function getPrefix() {
  return loadConfig().prefix;
}

// ─── Parse command ────────────────────────────────────────────────────────────
function parseMessage(message) {
  const prefix = getPrefix();
  if (!message.content.startsWith(prefix)) return null;
  const args = message.content.slice(prefix.length).trim().split(/\s+/);
  const command = args.shift().toLowerCase();
  return { command, args };
}
function parseDuration(str) {

  const match = str.match(/^(\d+)(s|m|h|d)$/i);

  if (!match) return null;

  const value = parseInt(match[1]);

  const unit = match[2].toLowerCase();

  switch (unit) {

    case "s": return value * 1000;

    case "m": return value * 60 * 1000;

    case "h": return value * 60 * 60 * 1000;

    case "d": return value * 24 * 60 * 60 * 1000;

    default: return null;

  }

}


// ─── READY ────────────────────────────────────────────────────────────────────
client.once("ready", () => {
  console.log(`✅ Connecté en tant que ${client.user.tag} (ID: ${client.user.id})`);
  client.user.setActivity("+help | Shiiro ", {
    type: ActivityType.Watching,
  });
});

// ─── MESSAGE EVENT ────────────────────────────────────────────────────────────
client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  const prefix = getPrefix();

  // Ping owners si le bot est mentionné
  if (
    message.mentions.has(client.user) &&
    !message.content.startsWith(prefix)
  ) {
    const cfg = loadConfig();
    if (!cfg.owner_ids.length) {
      return message.reply({
        embeds: [embedInfo("Aucun owner configuré. Utilisez `+setowner @user`.")],
      });
    }
    const ownerMentions = cfg.owner_ids.map((id) => `<@${id}>`).join(" ");
    const embed = new EmbedBuilder()
      .setTitle("👑 Ping Owner")
      .setDescription(
        `${message.author} a mentionné le bot !\n\n**Owners :** ${ownerMentions}`
      )
      .setColor(0xfee75c)
      .setTimestamp();
    return message.channel.send({ content: ownerMentions, embeds: [embed] });
  }

  const parsed = parseMessage(message);
  if (!parsed) return;
  const { command, args } = parsed;

if (command === "help") {

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

 // ─── Commandes de rôles personnalisés ─────────────────────
const customRole = getCustomRole(command);

if (customRole) {

  const target = message.mentions.members.first();

  if (!target) {
    return message.reply({
      embeds: [embedError(`Usage : +${command} @utilisateur`)]
    });
  }

  const role = message.guild.roles.cache.get(
    customRole.role_id
  );

  if (!role) {
    return message.reply({
      embeds: [embedError("Le rôle configuré n'existe plus.")]
    });
  }

if (message.author.id !== customRole.owner_id) {
  return message.reply({
    embeds: [
      embedError(
        "Vous n'êtes pas le propriétaire de cette commande."
      )
    ]
  });
}

  try {

    if (target.roles.cache.has(role.id)) {

      await target.roles.remove(role);

      return message.reply({
        embeds: [
          embedSuccess(`${role.name} retiré à ${target.user.tag}`)
        ]
      });

    } else {

      await target.roles.add(role);

      return message.reply({
        embeds: [
          embedSuccess(`${role.name} ajouté à ${target.user.tag}`)
        ]
      });

    }

  } catch {

    return message.reply({
      embeds: [
        embedError(
          "Impossible de modifier le rôle. Vérifiez la hiérarchie."
        )
      ]
    });

  }

}
  
 
  // ── !config ────────────────────────────────────────────────────────────────
  if (command === "config") {
    if (!isOwner(message.author.id))
      return message.reply({ embeds: [embedError("Seuls les owners peuvent voir la configuration.")] });
    const cfg = loadConfig();
    const embed = new EmbedBuilder()
      .setTitle("⚙️ Configuration actuelle")
      .setColor(0x57f287)
      .setTimestamp()
      .addFields(
        { name: "Préfixe", value: cfg.prefix, inline: true },
        {
          name: "Owners",
          value: cfg.owner_ids.map((i) => `<@${i}>`).join("\n") || "Aucun",
          inline: false,
        },
        {
          name: "Whitelist",
          value: cfg.whitelist.map((i) => `<@${i}>`).join("\n") || "Aucun",
          inline: false,
        },
        {
          name: "Rôles modérateurs",
          value: cfg.moderator_roles.map((i) => `<@&${i}>`).join("\n") || "Aucun",
          inline: false,
        },
        {
          name: "Salon de log",
          value: cfg.log_channel_id ? `<#${cfg.log_channel_id}>` : "Non défini",
          inline: true,
        }
      );
    return message.reply({ embeds: [embed] });
  }

// ── !setowner ──────────────────────────────────────────────────────────────
  if (command === "setowner") {
    const cfg = loadConfig();
    if (cfg.owner_ids.length && !isOwner(message.author.id))
      return message.reply({ embeds: [embedError("Seuls les owners peuvent ajouter un owner.")] });
    const member = message.mentions.members.first();
    if (!member)
      return message.reply({ embeds: [embedError("Mentionnez un utilisateur. Ex: `+setowner @user`")] });
    if (cfg.owner_ids.includes(member.id))
      return message.reply({ embeds: [embedWarn("Cet utilisateur est déjà owner.")] });
    cfg.owner_ids.push(member.id);
    saveConfig(cfg);
    await logAction(message.guild, "Ajout Owner", message.author.id, `<@${member.id}>`);
    return message.reply({ embeds: [embedSuccess(`👑 **${member.user.tag}** est maintenant owner.`)] });
  }

// ── !removeowner ───────────────────────────────────────────────────────────
  if (command === "removeowner") {
    if (!isOwner(message.author.id))
      return message.reply({ embeds: [embedError("Accès refusé.")] });
    const member = message.mentions.members.first();
    if (!member)
      return message.reply({ embeds: [embedError("Mentionnez un utilisateur.")] });
    const cfg = loadConfig();
    if (!cfg.owner_ids.includes(member.id))
      return message.reply({ embeds: [embedWarn("Cet utilisateur n'est pas owner.")] });
    if (cfg.owner_ids.length === 1)
      return message.reply({ embeds: [embedError("Impossible de retirer le dernier owner.")] });
    cfg.owner_ids = cfg.owner_ids.filter((id) => id !== member.id);
    saveConfig(cfg);
    await logAction(message.guild, "Retrait Owner", message.author.id, `<@${member.id}>`);
    return message.reply({ embeds: [embedSuccess(`**${member.user.tag}** n'est plus owner.`)] });
  }

// ── !owners ────────────────────────────────────────────────────────────────
  if (command === "owners") {
    const cfg = loadConfig();
    const liste = cfg.owner_ids.length
      ? cfg.owner_ids.map((i) => `<@${i}>`).join("\n")
      : "Aucun owner défini.";
    return message.reply({ embeds: [embedInfo(`**👑 Owners :**\n${liste}`)] });
  }

// ── !whitelist ─────────────────────────────────────────────────────────────
  if (command === "whitelist") {
    if (!isOwner(message.author.id))
      return message.reply({ embeds: [embedError("Seuls les owners peuvent gérer la whitelist.")] });
    const action = args[0];
    const member = message.mentions.members.first();
    const cfg = loadConfig();

    if (action === "add") {
      if (!member) return message.reply({ embeds: [embedError("Mentionnez un utilisateur.")] });
      if (cfg.whitelist.includes(member.id)) return message.reply({ embeds: [embedWarn("Déjà dans la whitelist.")] });
      cfg.whitelist.push(member.id);
      saveConfig(cfg);
      await logAction(message.guild, "Whitelist Add", message.author.id, `<@${member.id}>`);
      return message.reply({ embeds: [embedSuccess(`✅ **${member.user.tag}** ajouté à la whitelist.`)] });
    } else if (action === "remove") {
      if (!member) return message.reply({ embeds: [embedError("Mentionnez un utilisateur.")] });
      if (!cfg.whitelist.includes(member.id)) return message.reply({ embeds: [embedWarn("Cet utilisateur n'est pas dans la whitelist.")] });
      cfg.whitelist = cfg.whitelist.filter((id) => id !== member.id);
      saveConfig(cfg);
      await logAction(message.guild, "Whitelist Remove", message.author.id, `<@${member.id}>`);
      return message.reply({ embeds: [embedSuccess(`**${member.user.tag}** retiré de la whitelist.`)] });
    } else if (action === "list") {
      const liste = cfg.whitelist.length
        ? cfg.whitelist.map((i) => `<@${i}>`).join("\n")
        : "Whitelist vide.";
      return message.reply({ embeds: [embedInfo(`**📋 Whitelist :**\n${liste}`)] });
    } else {
      return message.reply({ embeds: [embedError("Usage : `+whitelist add/remove/list @user`")] });
    }
  }

// ── !modrole ───────────────────────────────────────────────────────────────
  if (command === "modrole") {
    if (!isOwner(message.author.id))
      return message.reply({ embeds: [embedError("Seuls les owners peuvent gérer les rôles modérateurs.")] });
    const action = args[0];
    const role = message.mentions.roles.first();
    const cfg = loadConfig();

    if (action === "add") {
      if (!role) return message.reply({ embeds: [embedError("Mentionnez un rôle.")] });
      if (cfg.moderator_roles.includes(role.id)) return message.reply({ embeds: [embedWarn("Ce rôle est déjà dans la liste.")] });
      cfg.moderator_roles.push(role.id);
      saveConfig(cfg);
      await logAction(message.guild, "ModRole Add", message.author.id, `<@&${role.id}>`, `Rôle : ${role.name}`);
      return message.reply({ embeds: [embedSuccess(`🛡️ Rôle **${role.name}** ajouté aux rôles modérateurs.`)] });
    } else if (action === "remove") {
      if (!role) return message.reply({ embeds: [embedError("Mentionnez un rôle.")] });
      if (!cfg.moderator_roles.includes(role.id)) return message.reply({ embeds: [embedWarn("Ce rôle n'est pas dans la liste.")] });
      cfg.moderator_roles = cfg.moderator_roles.filter((id) => id !== role.id);
      saveConfig(cfg);
      await logAction(message.guild, "ModRole Remove", message.author.id, `<@&${role.id}>`);
      return message.reply({ embeds: [embedSuccess(`Rôle **${role.name}** retiré des rôles modérateurs.`)] });
    } else if (action === "list") {
      const liste = cfg.moderator_roles.length
        ? cfg.moderator_roles.map((i) => `<@&${i}>`).join("\n")
        : "Aucun rôle modérateur défini.";
      return message.reply({ embeds: [embedInfo(`**🛡️ Rôles modérateurs :**\n${liste}`)] });
    } else {
      return message.reply({ embeds: [embedError("Usage : `+modrole add/remove/list @role`")] });
    }
  }

// ── !giverole ──────────────────────────────────────────────────────────────// ── !giverole ──────────────────────────────────────────────────────────────
  if (command === "giverole") {
    if (!isWhitelisted(message.author.id))
      return message.reply({ embeds: [embedError("Vous n'êtes pas dans la whitelist.")] });
    const member = message.mentions.members.first();
    const role = message.mentions.roles.first();
    if (!member || !role)
      return message.reply({ embeds: [embedError("Usage : `+giverole @user @role`")] });
    const cfg = loadConfig();
    if (!cfg.moderator_roles.includes(role.id))
      return message.reply({ embeds: [embedError("Ce rôle n'est pas dans la liste des rôles modérateurs autorisés.")] });
    try {
      await member.roles.add(role, `Ajout par ${message.author.tag}`);
      await logAction(message.guild, "Rôle Donné", message.author.id, `<@${member.id}>`, `Rôle : ${role.name}`);
      return message.reply({ embeds: [embedSuccess(`✅ Rôle **${role.name}** donné à **${member.user.tag}**.`)] });
    } catch {
      return message.reply({ embeds: [embedError("Permission refusée. Vérifiez la hiérarchie des rôles du bot.")] });
    }
  }

// ── !takerole ──────────────────────────────────────────────────────────────
  if (command === "takerole") {
    if (!isWhitelisted(message.author.id))
      return message.reply({ embeds: [embedError("Vous n'êtes pas dans la whitelist.")] });
    const member = message.mentions.members.first();
    const role = message.mentions.roles.first();
    if (!member || !role)
      return message.reply({ embeds: [embedError("Usage : `+takerole @user @role`")] });
    const cfg = loadConfig();
    if (!cfg.moderator_roles.includes(role.id))
      return message.reply({ embeds: [embedError("Ce rôle n'est pas dans la liste des rôles modérateurs autorisés.")] });
    try {
      await member.roles.remove(role, `Retrait par ${message.author.tag}`);
      await logAction(message.guild, "Rôle Retiré", message.author.id, `<@${member.id}>`, `Rôle : ${role.name}`);
      return message.reply({ embeds: [embedSuccess(`🗑️ Rôle **${role.name}** retiré à **${member.user.tag}**.`)] });
    } catch {
      return message.reply({ embeds: [embedError("Permission refusée. Vérifiez la hiérarchie des rôles du bot.")] });
    }
  }

// ── !ban ──────────────────────────────────────────────────────────────
if (command === "ban") {

  if (!isWhitelisted(message.author.id))
    return message.reply({
      embeds: [embedError("Commande réservée aux owners et aux membres whitelist.")]
    });

  const member = message.mentions.members.first();

  if (!member)
    return message.reply({
      embeds: [embedError("Usage : +ban @utilisateur")]
    });

  const modal = new ModalBuilder()
    .setCustomId(`ban_modal_${member.id}`)
    .setTitle("Bannir un utilisateur");

  const reasonInput = new TextInputBuilder()
    .setCustomId("ban_reason")
    .setLabel("Raison du bannissement")
    .setStyle(TextInputStyle.Paragraph)
    .setRequired(true)
    .setMaxLength(500);

  modal.addComponents(
    new ActionRowBuilder().addComponents(reasonInput)
  );

  await message.reply({
    content: "Clique sur le bouton pour ouvrir le formulaire.",
    components: [
      new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId(`open_ban_modal_${member.id}`)
          .setLabel("🔨 Bannir")
          .setStyle(ButtonStyle.Danger)
      )
    ]
  });

  return;
}

  // ── !unban ──────────────────────────────────────────────
if (command === "unban") {

  if (!isWhitelisted(message.author.id))
    return message.reply({
      embeds: [
        embedError(
          "Commande réservée aux owners et aux membres whitelist."
        )
      ]
    });

  const userId = args[0];

  if (!userId)
    return message.reply({
      embeds: [
        embedError("Usage : +unban ID_UTILISATEUR")
      ]
    });

  try {

    const user = await client.users.fetch(userId);

    try {

      const dmEmbed = new EmbedBuilder()
        .setColor(0x57F287)
        .setTitle("✅ Débannissement")
        .setDescription(
          "Tu as été débanni de Shiiro.\n\n" +
          "Tu peux maintenant rejoindre le serveur."
        );

      await user.send({
        embeds: [dmEmbed]
      });

    } catch {}

    await message.guild.members.unban(
      userId,
      `Unban par ${message.author.tag}`
    );

    await logAction(
      message.guild,
      "Unban",
      message.author.id,
      `<@${userId}>`
    );

    return message.reply({
      embeds: [
        embedSuccess(
          `${user.tag} a été débanni.`
        )
      ]
    });

  } catch (err) {

    console.error(err);

    return message.reply({
      embeds: [
        embedError(
          "Utilisateur introuvable ou non banni."
        )
      ]
    });

  }

}

// ── !bypass ──────────────────────
if (command === "bypass") {

  if (!isWhitelisted(message.author.id))
    return message.reply({
      embeds: [
        embedError("Commande réservée aux owners et whitelist.")
      ]
    });

  const userId = args[0];

  if (!userId)
    return message.reply({
      embeds: [
        embedError("Usage : +bypass ID_UTILISATEUR")
      ]
    });

  try {

    const user = await client.users.fetch(userId);

    // Déban
    await message.guild.members.unban(
      userId,
      `Bypass accordé par ${message.author.tag}`
    );

    // MP
    try {

      const embed = new EmbedBuilder()
        .setColor(0x57F287)
        .setTitle("✅ Bypass accepté")
        .setDescription(
          "Ta demande de bypass a été acceptée.\n\n" +
          "Tu peux maintenant rejoindre Shiiro :\n\n" +
          "https://discord.gg/nCvVCmXdUZ"
        );

      await user.send({
        embeds: [embed]
      });

    } catch {}

    await logAction(
      message.guild,
      "Bypass",
      message.author.id,
      `<@${userId}>`
    );

    return message.reply({
      embeds: [
        embedSuccess(
          `${user.tag} a été débanni et a reçu le lien du serveur.`
        )
      ]
    });

  } catch (err) {

    console.error(err);

    return message.reply({
      embeds: [
        embedError(
          "Utilisateur introuvable ou non banni."
        )
      ]
    });

  }

}

// ── !mp ──────────────────────────────────────────────
if (command === "mp") {

  if (!isWhitelisted(message.author.id))
    return message.reply({
      embeds: [
        embedError("Commande réservée aux owners et whitelist.")
      ]
    });

  const member = message.mentions.members.first();

  if (!member)
    return message.reply({
      embeds: [
        embedError("Usage : +mp @utilisateur message")
      ]
    });

  const text = args.slice(1).join(" ");

  if (!text)
    return message.reply({
      embeds: [
        embedError("Usage : +mp @utilisateur message")
      ]
    });

  try {

    const embed = new EmbedBuilder()
      .setColor(0x5865F2)
      .setTitle("📩 Message de l'équipe Shiiro")
      .setDescription(text)
      .setTimestamp();

    await member.send({
      embeds: [embed]
    });

    await logAction(
      message.guild,
      "MP",
      message.author.id,
      `<@${member.id}>`,
      text
    );

    return message.reply({
      embeds: [
        embedSuccess(`Message envoyé à ${member.user.tag}.`)
      ]
    });

  } catch {

    return message.reply({
      embeds: [
        embedError("Impossible d'envoyer le message privé.")
      ]
    });

  }

}

// ── !say ───────────────────────────────────────────────────────────────────
  if (command === "say") {
    if (!isWhitelisted(message.author.id))
      return message.reply({ embeds: [embedError("Accès refusé.")] });
    const channel = message.mentions.channels.first();
    const content = args.slice(1).join(" "); // skip the channel mention
    if (!channel || !content)
      return message.reply({ embeds: [embedError("Usage : `+say #salon votre message`")] });
    try {
      await channel.send(content);
      await message.react("✅");
      await logAction(message.guild, "Message Envoyé", message.author.id, `<#${channel.id}>`, content.slice(0, 100));
    } catch {
      return message.reply({ embeds: [embedError("Impossible d'envoyer dans ce salon.")] });
    }
    return;
  }

// ── !embed ─────────────────────────────────────────────────────────────────
  if (command === "embed") {
    if (!isWhitelisted(message.author.id))
      return message.reply({ embeds: [embedError("Accès refusé.")] });
    const channel = message.mentions.channels.first();
    const rest = args.slice(1).join(" ");
    if (!channel || !rest || !rest.includes("|"))
      return message.reply({ embeds: [embedError("Usage : `+embed #salon Titre | Description`")] });
    const [titre, ...descParts] = rest.split("|");
    const description = descParts.join("|");
    const embed = new EmbedBuilder()
      .setTitle(titre.trim())
      .setDescription(description.trim())
      .setColor(0x5865f2)
      .setTimestamp()
      .setFooter({ text: `Envoyé par ${message.author.tag}` });
    try {
      await channel.send({ embeds: [embed] });
      await message.react("✅");
      await logAction(message.guild, "Embed Envoyé", message.author.id, `<#${channel.id}>`, titre.trim());
    } catch {
      return message.reply({ embeds: [embedError("Impossible d'envoyer dans ce salon.")] });
    }
    return;
  }

// ── !panel ────────────────────────────────────────────────
if (command === "panel") {

  if (!isOwner(message.author.id))
    return message.reply({
embeds: [embedError("Seuls les owners peuvent utiliser `+panel`.")]
});

  const embed = new EmbedBuilder()
    .setTitle("⚙️ Gestion des rôles personnalisés")
    .setDescription(
      "Utilisez les boutons ci-dessous pour gérer les rôles personnalisés."
    )
    .setColor(0x5865f2);

  const row = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId("customrole_add")
        .setLabel("➕ Ajouter")
        .setStyle(ButtonStyle.Success),

      new ButtonBuilder()
        .setCustomId("customrole_remove")
        .setLabel("🗑️ Supprimer")
        .setStyle(ButtonStyle.Danger),

      new ButtonBuilder()
        .setCustomId("customrole_list")
        .setLabel("📋 Liste")
        .setStyle(ButtonStyle.Primary)
    );

  return message.reply({
    embeds: [embed],
    components: [row]
  });

}

// ── !wl ──────────────────────────────────────────────
if (command === "wl") {

  if (!isOwner(message.author.id))
    return message.reply({
      embeds: [
        embedError(
          "Seuls les owners peuvent gérer la whitelist giveaway."
        )
      ]
    });

  const member = message.mentions.members.first();

  if (!member)
    return message.reply({
      embeds: [
     embedError("Usage : `+wl @utilisateur`")
      ]
    });

  const cfg = loadConfig();

  if (!cfg.giveaway_whitelist.includes(member.id)) {
    cfg.giveaway_whitelist.push(member.id);
    saveConfig(cfg);
  }

  return message.reply({
    embeds: [
      embedSuccess(
        `${member.user.tag} ajouté à la whitelist giveaway.`
      )
    ]
  });

}

  // ── !wllist ──────────────────────────────────────────
if (command === "wllist") {

  if (!isOwner(message.author.id))
    return message.reply({
      embeds: [
        embedError("Seuls les owners peuvent voir la liste.")
      ]
    });

  const cfg = loadConfig();

  const liste = cfg.giveaway_whitelist.length
    ? cfg.giveaway_whitelist.map(id => `<@${id}>`).join("\n")
    : "Aucun utilisateur.";

  return message.reply({
    embeds: [
      embedInfo(`🎰 **Whitelist Giveaway**\n\n${liste}`)
    ]
  });

}
 // ── !gw ──────────────────────────────────────────────
if (command === "gw") {

if (!isCasinoWhitelisted(message.author.id))

    return message.reply({
      embeds: [embedError("Accès refusé.")]
    });

  const filter = m => m.author.id === message.author.id;

  await message.channel.send("🎁 Quel est le lot ?");

  const prizeMsg = await message.channel.awaitMessages({
    filter,
    max: 1,
    time: 60000
  });

  const prize = prizeMsg.first().content;

  await message.channel.send("⏳ Durée ? (ex: 1h, 30d, 90d)");

  const durationMsg = await message.channel.awaitMessages({
    filter,
    max: 1,
    time: 60000
  });

  const duration = durationMsg.first().content;

  await message.channel.send("👑 Nombre de gagnants ?");

  const winnersMsg = await message.channel.awaitMessages({
    filter,
    max: 1,
    time: 60000
  });

  const winnerCount = parseInt(winnersMsg.first().content);

  await message.channel.send("😀 Emoji de participation ?");

  const emojiMsg = await message.channel.awaitMessages({
    filter,
    max: 1,
    time: 60000
  });

  const emoji = emojiMsg.first().content;

  await message.channel.send("📢 Mentionne le salon du giveaway");

  const channelMsg = await message.channel.awaitMessages({
    filter,
    max: 1,
    time: 60000
  });

  const giveawayChannel =
    channelMsg.first().mentions.channels.first();

  if (!giveawayChannel)
    return message.reply({
      embeds: [embedError("Salon invalide.")]
    });

  await message.channel.send({
    embeds: [
      new EmbedBuilder()
        .setTitle("🎁 Prévisualisation Giveaway")
        .setDescription(
          `🏆 Lot : ${prize}\n` +
          `⏳ Durée : ${duration}\n` +
          `👑 Gagnants : ${winnerCount}\n` +
          `😀 Emoji : ${emoji}\n` +
          `📢 Salon : ${giveawayChannel}`
        )
        .setColor(0xFEE75C)
    ]
  });

  await message.channel.send(
    "✅ Tape `oui` pour confirmer ou `non` pour annuler."
  );

  const confirmMsg = await message.channel.awaitMessages({
    filter,
    max: 1,
    time: 60000
  });

  const confirmation =
    confirmMsg.first().content.toLowerCase();

  if (confirmation !== "oui")
  return message.channel.send("❌ Giveaway annulé.");

const durationMs = parseDuration(duration);

if (!durationMs)
  return message.reply({
    embeds: [embedError("Durée invalide.")]
  });

const endAt = Date.now() + durationMs;
const endTimestamp = Math.floor(endAt / 1000);

const giveawayEmbed = new EmbedBuilder()
  .setColor(0xFEE75C)
  .setTitle(`🎉 ${prize}`)
  .setDescription(
    `Réagis avec ${emoji} pour participer !`
  )
  .addFields(
    {
      name: "👑 Gagnants",
      value: `${winnerCount}`,
      inline: true
    },
    {
      name: "🎤 Organisateur",
      value: `${message.author}`,
      inline: true
    },
    {
      name: "⏰ Fin",
      value: `<t:${endTimestamp}:F>\n<t:${endTimestamp}:R>`
    }
  )
  .setTimestamp();

const giveawayMessage = await giveawayChannel.send({
  embeds: [giveawayEmbed]
});

await giveawayMessage.react(emoji);

saveGiveaway(giveawayMessage.id, {
  channelId: giveawayChannel.id,
  prize,
  emoji,
  winnerCount,
  endAt
});
  console.log("Giveaways actuels :", loadGiveaways());

return message.channel.send(

  `✅ Giveaway envoyé dans ${giveawayChannel}`

);
}
  if (command === "greroll") {

  if (!isCasinoWhitelisted(message.author.id))
    return message.reply({
      embeds: [embedError("Accès refusé.")]
    });

  const messageId = args[0];

  if (!messageId)
    return message.reply({
      embeds: [
        embedError("Usage : +greroll ID_MESSAGE")
      ]
    });

  const giveaways = loadGiveaways();

  const giveaway = giveaways.find(
    g => g.messageId === messageId
  );

  if (!giveaway)
    return message.reply({
      embeds: [
        embedError("Giveaway introuvable.")
      ]
    });

  try {

    const channel = await client.channels.fetch(
      giveaway.channelId
    );

    const giveawayMessage =
      await channel.messages.fetch(
        giveaway.messageId
      );

    const reaction =
      giveawayMessage.reactions.cache.find(
        r =>
          r.emoji.name === giveaway.emoji ||
          r.emoji.id === giveaway.emoji
      );

    if (!reaction)
      return message.reply({
        embeds: [
          embedError("Aucune participation trouvée.")
        ]
      });

    const users = await reaction.users.fetch();

    const participants = users
      .filter(u => !u.bot)
      .map(u => u);

    if (participants.length === 0)
      return message.reply({
        embeds: [
          embedError("Aucun participant valide.")
        ]
      });

    const winner =
      participants[
        Math.floor(
          Math.random() * participants.length
        )
      ];

    await channel.send({
      embeds: [
        new EmbedBuilder()
          .setColor(0xFEE75C)
          .setTitle("🔄 Giveaway Reroll")
          .addFields(
            {
              name: "🏆 Lot",
              value: giveaway.prize
            },
            {
              name: "👑 Nouveau gagnant",
              value: `${winner}`
            }
          )
          .setTimestamp()
      ]
    });

    return message.reply({
      embeds: [
        embedSuccess(
          `Nouveau gagnant : ${winner.tag}`
        )
      ]
    });

  } catch (err) {

    console.error(err);

    return message.reply({
      embeds: [
        embedError(
          "Impossible d'effectuer le reroll."
        )
      ]
    });

  }
}

  if (command === "gend") {

  if (!isCasinoWhitelisted(message.author.id))
    return message.reply({
      embeds: [embedError("Accès refusé.")]
    });

  const messageId = args[0];

  if (!messageId)
    return message.reply({
      embeds: [
        embedError("Usage : +gend ID_MESSAGE")
      ]
    });

  const giveaways = loadGiveaways();

  const giveaway = giveaways.find(
    g => g.messageId === messageId
  );

  if (!giveaway)
    return message.reply({
      embeds: [
        embedError("Giveaway introuvable.")
      ]
    });

  try {

    const channel = await client.channels.fetch(
      giveaway.channelId
    );

    const giveawayMessage =
      await channel.messages.fetch(
        giveaway.messageId
      );

    const reaction =
      giveawayMessage.reactions.cache.find(
        r =>
          r.emoji.name === giveaway.emoji ||
          r.emoji.id === giveaway.emoji
      );

    if (!reaction)
      return message.reply({
        embeds: [
          embedError("Aucune participation trouvée.")
        ]
      });

    const users = await reaction.users.fetch();

    const participants = users
      .filter(u => !u.bot)
      .map(u => u);

    if (participants.length === 0) {

      await channel.send(
        `❌ Giveaway terminé pour **${giveaway.prize}**.\nAucun participant valide.`
      );

    } else {

      const winners = [];

      const winnerAmount = Math.min(
        giveaway.winnerCount,
        participants.length
      );

      for (let i = 0; i < winnerAmount; i++) {

        const randomIndex = Math.floor(
          Math.random() * participants.length
        );

        winners.push(
          participants.splice(randomIndex, 1)[0]
        );
      }

      await channel.send(
        `🎉 Giveaway terminé !\n\n🏆 Lot : **${giveaway.prize}**\n👑 Gagnant(s) : ${winners.join(", ")}`
      );
    }

    saveGiveaways(
      giveaways.filter(
        g => g.messageId !== messageId
      )
    );

    return message.reply({
      embeds: [
        embedSuccess("Giveaway terminé avec succès.")
      ]
    });

  } catch (err) {

    console.error(err);

    return message.reply({
      embeds: [
        embedError(
          "Impossible de terminer ce giveaway."
        )
      ]
    });

  }
}if (command === "gend") {

  if (!isCasinoWhitelisted(message.author.id))
    return message.reply({
      embeds: [embedError("Accès refusé.")]
    });

  const messageId = args[0];

  if (!messageId)
    return message.reply({
      embeds: [
        embedError("Usage : +gend ID_MESSAGE")
      ]
    });

  const giveaways = loadGiveaways();

  const giveaway = giveaways.find(
    g => g.messageId === messageId
  );

  if (!giveaway)
    return message.reply({
      embeds: [
        embedError("Giveaway introuvable.")
      ]
    });

  try {

    const channel = await client.channels.fetch(
      giveaway.channelId
    );

    const giveawayMessage =
      await channel.messages.fetch(
        giveaway.messageId
      );

    const reaction =
      giveawayMessage.reactions.cache.find(
        r =>
          r.emoji.name === giveaway.emoji ||
          r.emoji.id === giveaway.emoji
      );

    if (!reaction)
      return message.reply({
        embeds: [
          embedError("Aucune participation trouvée.")
        ]
      });

    const users = await reaction.users.fetch();

    const participants = users
      .filter(u => !u.bot)
      .map(u => u);

    if (participants.length === 0) {

      await channel.send(
        `❌ Giveaway terminé pour **${giveaway.prize}**.\nAucun participant valide.`
      );

    } else {

      const winners = [];

      const winnerAmount = Math.min(
        giveaway.winnerCount,
        participants.length
      );

      for (let i = 0; i < winnerAmount; i++) {

        const randomIndex = Math.floor(
          Math.random() * participants.length
        );

        winners.push(
          participants.splice(randomIndex, 1)[0]
        );
      }

      await channel.send(
        `🎉 Giveaway terminé !\n\n🏆 Lot : **${giveaway.prize}**\n👑 Gagnant(s) : ${winners.join(", ")}`
      );
    }

    saveGiveaways(
      giveaways.filter(
        g => g.messageId !== messageId
      )
    );

    return message.reply({
      embeds: [
        embedSuccess("Giveaway terminé avec succès.")
      ]
    });

  } catch (err) {

    console.error(err);

    return message.reply({
      embeds: [
        embedError(
          "Impossible de terminer ce giveaway."
        )
      ]
    });

  }
}
// ── !setlog ────────────────────────────────────────────────────────────────
  if (command === "setlog") {
    if (!isOwner(message.author.id))
      return message.reply({ embeds: [embedError("Seuls les owners peuvent définir le salon de log.")] });
    const channel = message.mentions.channels.first();
    if (!channel)
      return message.reply({ embeds: [embedError("Mentionnez un salon.")] });
    const cfg = loadConfig();
    cfg.log_channel_id = channel.id;
    saveConfig(cfg);
    return message.reply({ embeds: [embedSuccess(`📌 Salon de log défini : ${channel}`)] });
  }

if (command === "lock") {
  console.log("Commande LOCK détectée");

  if (!isModerator(message.member))
    return message.reply({
      embeds: [embedError("Permission refusée.")]
    });

  const everyone = message.guild.roles.everyone;

  const perms = message.channel.permissionsFor(everyone);

  const locked = !perms.has("SendMessages");

  await message.channel.permissionOverwrites.edit(
    everyone,
    {
      SendMessages: locked
    }
  );

  return message.reply({
    embeds: [
      embedSuccess(
        locked
          ? "🔓 Salon déverrouillé."
          : "🔒 Salon verrouillé."
      )
    ]
  });
}

if (command === "hide") {
  console.log("Commande HIDE détectée");

  if (!isModerator(message.member))
    return message.reply({
      embeds: [embedError("Permission refusée.")]
    });

  const everyone = message.guild.roles.everyone;

  const perms = message.channel.permissionsFor(everyone);

  const hidden = !perms.has("ViewChannel");

  await message.channel.permissionOverwrites.edit(
    everyone,
    {
      ViewChannel: hidden
    }
  );

  return message.reply({
    embeds: [
      embedSuccess(
        hidden
          ? "👀 Salon affiché."
          : "🙈 Salon masqué."
      )
    ]
  });
}
  
});

// ─── Lancement ────────────────────────────────────────────────────────────────
const token = "MTUxNDI4Njk2OTEyMTkzNTQwMA.GsZQgT.tWGRIV2kKcOCQa3-wHQfBBu2GFuotri8yH9PcM";
console.log("Token chargé :", !!token);
if (!token) {
  console.error("❌ DISCORD_TOKEN manquant. Définissez la variable d'environnement DISCORD_TOKEN.");
  process.exit(1);
}

client.on("interactionCreate", async (interaction) => {

  if (interaction.isButton()) {

    if (interaction.customId.startsWith("open_ban_modal_")) {

      const userId = interaction.customId.replace(
        "open_ban_modal_",
        ""
      );

      const modal = new ModalBuilder()
        .setCustomId(`ban_modal_${userId}`)
        .setTitle("Bannir un utilisateur");

      const reasonInput = new TextInputBuilder()
        .setCustomId("ban_reason")
        .setLabel("Raison du bannissement")
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(true);

      modal.addComponents(
        new ActionRowBuilder().addComponents(reasonInput)
      );

      return interaction.showModal(modal);
    }
  if (interaction.customId === "customrole_add") {

  const modal = new ModalBuilder()
    .setCustomId("customrole_add_modal")
    .setTitle("Ajouter un rôle personnalisé");

  const roleInput = new TextInputBuilder()
    .setCustomId("role_name")
    .setLabel("Nom exact du rôle Discord")
    .setStyle(TextInputStyle.Short)
    .setRequired(true);

  const row = new ActionRowBuilder()
    .addComponents(roleInput);

  modal.addComponents(row);

  return interaction.showModal(modal);

}
if (interaction.customId === "customrole_remove") {

  const roles = getCustomRoles();

  if (Object.keys(roles).length === 0) {
    return interaction.reply({
      content: "❌ Aucun rôle personnalisé configuré.",
      ephemeral: true
    });
  }

  const options = Object.keys(roles)
    .slice(0, 25)
    .map(cmd => ({
      label: `+${cmd}`,
      value: cmd
    }));

  const menu = new StringSelectMenuBuilder()
    .setCustomId("customrole_delete_select")
    .setPlaceholder("Choisissez une commande à supprimer")
    .addOptions(options);

  const row = new ActionRowBuilder()
    .addComponents(menu);

  return interaction.reply({
    content: "🗑️ Sélectionnez la commande à supprimer :",
    components: [row],
    ephemeral: true
  });

}

    if (interaction.customId === "customrole_list") {

      const roles = getCustomRoles();

      if (Object.keys(roles).length === 0) {
        return interaction.reply({
          content: "❌ Aucun rôle personnalisé configuré.",
          ephemeral: true
        });
      }

      const txt = Object.entries(roles)
        .map(([cmd, data]) => {
          const role = interaction.guild.roles.cache.get(data.role_id);
          return `• +${cmd} → ${role ? role.name : "Rôle supprimé"}`;
        })
        .join("\n");

      return interaction.reply({
        content: txt,
        ephemeral: true
      });

    }

  }

  if (interaction.isStringSelectMenu()) {

    if (interaction.customId === "role_select") {

  const roleId = interaction.values[0];

  const role = interaction.guild.roles.cache.get(roleId);

  if (!role) {
    return interaction.reply({
      content: "❌ Rôle introuvable.",
      ephemeral: true
    });
  }

  const commandName = role.name
    .toLowerCase()
    .replace(/\s+/g, "_");

  addCustomRole(
    commandName,
    roleId,
    interaction.user.id
  );

  return interaction.reply({
    content:
      `✅ Commande créée : +${commandName}\n` +
      `👑 Propriétaire : ${interaction.user.tag}\n` +
      `🎭 Rôle : ${role.name}`,
    ephemeral: true
  });

}if (interaction.customId === "role_select") {

  const roleId = interaction.values[0];

  const role = interaction.guild.roles.cache.get(roleId);

  if (!role) {
    return interaction.reply({
      content: "❌ Rôle introuvable.",
      ephemeral: true
    });
  }

  const commandName = role.name
    .toLowerCase()
    .replace(/\s+/g, "_");

  addCustomRole(
    commandName,
    roleId,
    interaction.user.id
  );

  return interaction.reply({
    content:
      `✅ Commande créée : +${commandName}\n` +
      `👑 Propriétaire : ${interaction.user.tag}\n` +
      `🎭 Rôle : ${role.name}`,
    ephemeral: true
  });

}
if (interaction.customId === "customrole_delete_select") {

  const commandName = interaction.values[0];

  removeCustomRole(commandName);

  return interaction.reply({
    content: `✅ La commande +${commandName} a été supprimée.`,
    ephemeral: true
  });

}
  }

if (interaction.isModalSubmit()) {

    if (interaction.customId.startsWith("ban_modal_")) {

      const userId = interaction.customId.replace(
        "ban_modal_",
        ""
      );

      const member = await interaction.guild.members
        .fetch(userId)
        .catch(() => null);

      if (!member) {
        return interaction.reply({
          content: "❌ Utilisateur introuvable.",
          ephemeral: true
        });
      }

      const reason =
        interaction.fields.getTextInputValue("ban_reason");

      try {

        try {

          const dmEmbed = new EmbedBuilder()
            .setColor(0xED4245)
            .setTitle("🚫 Bannissement")
            .setDescription(
              "Tu as été banni de Shiiro.\n\n" +
              "Pour demander ton unban, rejoins ce serveur et ouvre un ticket.\n\n" +
              "https://discord.gg/FZqjCqMmXY"
            );

          await member.send({
            embeds: [dmEmbed]
          });

        } catch {}

        await member.ban({ reason });

        return interaction.reply({
          content: `✅ ${member.user.tag} a été banni.`,
          ephemeral: true
        });

      } catch (err) {

        console.error(err);

        return interaction.reply({
          content: "❌ Impossible de bannir cet utilisateur.",
          ephemeral: true
        });

      }

    }
  
  if (interaction.customId === "customrole_add_modal") {

    const roleName = interaction.fields.getTextInputValue("role_name");

    const role = interaction.guild.roles.cache.find(
      r => r.name.toLowerCase() === roleName.toLowerCase()
    );

    if (!role) {
      return interaction.reply({
        content: `❌ Rôle introuvable : ${roleName}`,
        ephemeral: true
      });
    }

    const commandName = role.name
      .toLowerCase()
      .replace(/\s+/g, "_");

    addCustomRole(commandName, role.id);

    return interaction.reply({
      content: `✅ Commande créée : +${commandName}`,
      ephemeral: true
    });

  }

}

});
client.on("guildMemberAdd", async (member) => {

  if (member.user.bot) return;

  const accountAge =
    Date.now() - member.user.createdTimestamp;

  const sevenDays =
    7 * 24 * 60 * 60 * 1000;

  if (accountAge < sevenDays) {

    try {

      await member.send({
        embeds: [
          new EmbedBuilder()
            .setColor(0xED4245)
            .setTitle("🚫 Bannissement automatique")
            .setDescription(
              "Ton compte est trop récent donc il a été banni de Shiiro.\n\n" +
              "Pour demander un bypass, ouvre un ticket ici :\n" +
              "https://discord.gg/FZqjCqMmXY"
            )
        ]
      });

    } catch {}

    await member.ban({
      reason: "Compte Discord de moins de 7 jours"
    });

    return;
  }

  const channel = member.guild.channels.cache.get("1508491934547574814");

  if (!channel) return;

  const embed = new EmbedBuilder()
    .setColor(0x5865F2)
    .setTitle("🎉 Bienvenue sur Shiiro")
    .setDescription(
      `Bienvenue ${member} !\n\nGrâce à toi, nous sommes désormais **${member.guild.memberCount} membres**.`
    )
    .setThumbnail(member.user.displayAvatarURL())
    .setImage("https://static.klipy.com/ii/e1b92bb53e0c9e442408bc677a56c789/cf/4e/squUjOdmywiQ7oM8Q.gif")
    .setTimestamp();

  await channel.send({ embeds: [embed] });

}); // <-- fermeture de guildMemberAdd
client.once("clientReady", () => {
  console.log(`${client.user.tag} connecté !`);

  client.user.setPresence({
    activities: [
      {
        name: ".gg/shiiro",
        type: ActivityType.Streaming,
        url: "https://www.twitch.tv/leox123bs"
      }
    ],
    status: "online"
  });
});

// ─── Giveaways ─────────────────────────────────────────

let giveawayRunning = false;

setInterval(async () => {

  if (giveawayRunning) return;
  giveawayRunning = true;

  try {

    console.log("🔄 Giveaway checker exécuté");

    const giveaways = loadGiveaways();
    const remaining = [];

    for (const gw of giveaways) {

      if (Date.now() < gw.endAt) {
        remaining.push(gw);
        continue;
      }

      try {

        const channel =
          await client.channels.fetch(gw.channelId);

        const message =
          await channel.messages.fetch(gw.messageId);

        const reaction = message.reactions.cache.find(
          r => gw.emoji.includes(r.emoji.id)
        );

        console.log(
          "Réactions trouvées :",
          message.reactions.cache.map(r => ({
            name: r.emoji.name,
            id: r.emoji.id
          }))
        );

        console.log("Emoji sauvegardé :", gw.emoji);

        if (!reaction) {
          console.log("Aucune réaction trouvée");
          continue;
        }

        const users = await reaction.users.fetch();

        const participants = users
          .filter(u => !u.bot)
          .map(u => u);

        console.log(
          "Participants :",
          participants.map(p => p.tag)
        );

        console.log("winnerCount =", gw.winnerCount);

console.log("type =", typeof gw.winnerCount);

console.log("participants.length =", participants.length);
        if (participants.length === 0) {
          await channel.send(
            `❌ Giveaway terminé pour **${gw.prize}**. Aucun participant valide.`
          );
          continue;
        }

        const winners = [];

const winnerAmount = Math.min(
  gw.winnerCount,
  participants.length
);

for (let i = 0; i < winnerAmount; i++) {

  const randomIndex =
    Math.floor(Math.random() * participants.length);

  winners.push(
    participants.splice(randomIndex, 1)[0]
  );

}
        console.log(
          "Gagnants :",
          winners.map(w => w.tag)
        );

        await channel.send(
          `🎉 Giveaway terminé !\n\n🏆 Lot : **${gw.prize}**\n👑 Gagnant(s) : ${winners.join(", ")}`
        );

        console.log(
  "Nombre final de gagnants =",
  winners.length
);
        console.log(
          "Giveaway terminé et supprimé :",
          gw.messageId
        );

        // On ne remet PAS le giveaway dans remaining
        // donc il sera supprimé au prochain saveGiveaways()

      } catch (err) {

        console.error(
          "Erreur giveaway :",
          err
        );

      }

    }

    saveGiveaways(remaining);

  } catch (err) {

    console.error(
      "Erreur giveaway system :",
      err
    );

  } finally {

    giveawayRunning = false;

  }

}, 30000);

// ─── Connexion ─────────────────────────────────────────

console.log(process.env.TEST);

client.login(token);
  
