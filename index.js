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
  prefix: "!",
  owner_ids: [],
  whitelist: [],
  moderator_roles: [],
  log_channel_id: null,
  custom_roles: {}
};
    saveConfig(defaultCfg);
    return defaultCfg;
  }
  return JSON.parse(fs.readFileSync(CONFIG_PATH, "utf-8"));
}

function saveConfig(config) {
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2), "utf-8");
}

function getCustomRoles() {
  const cfg = loadConfig();

  if (!cfg.custom_roles) {
    cfg.custom_roles = {};
    saveConfig(cfg);
  }

  return cfg.custom_roles;
}

function addCustomRole(commandName, roleId) {
  const cfg = loadConfig();

  if (!cfg.custom_roles)
    cfg.custom_roles = {};

  cfg.custom_roles[commandName.toLowerCase()] = {
    role_id: roleId,
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

function isOwner(userId) {
  return loadConfig().owner_ids.includes(userId);
}

function isWhitelisted(userId) {
  const cfg = loadConfig();
  return cfg.owner_ids.includes(userId) || cfg.whitelist.includes(userId);
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

// ─── READY ────────────────────────────────────────────────────────────────────
client.once("ready", () => {
  console.log(`✅ Connecté en tant que ${client.user.tag} (ID: ${client.user.id})`);
  client.user.setActivity("!help | Gestion des rôles", {
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
        embeds: [embedInfo("Aucun owner configuré. Utilisez `!setowner @user`.")],
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

  // ─── Commandes de rôles personnalisés ─────────────────────
const customRole = getCustomRole(command);

if (customRole) {

  const target = message.mentions.members.first();

  if (!target) {
    return message.reply({
      embeds: [embedError(`Usage : !${command} @utilisateur`)]
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

  if (!message.member.roles.cache.has(role.id)) {
    return message.reply({
      embeds: [embedError(`Vous devez posséder le rôle ${role.name}.`)]
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
  
  // ── !help ──────────────────────────────────────────────────────────────────
  if (command === "help") {
    const cfg = loadConfig();
    const embed = new EmbedBuilder()
      .setTitle("📖 Commandes du Bot")
      .setDescription("Gestion des rôles modérateurs via Whitelist")
      .setColor(0x5865f2)
      .setTimestamp()
      .addFields(
        {
          name: "👑 Owners",
          value:
            "`!setowner @user` — Ajouter un owner\n`!removeowner @user` — Retirer un owner\n`!owners` — Lister les owners",
          inline: false,
        },
        {
          name: "📋 Whitelist",
          value:
            "`!whitelist add @user` — Ajouter\n`!whitelist remove @user` — Retirer\n`!whitelist list` — Voir la liste",
          inline: false,
        },
        {
          name: "🛡️ Rôles modérateurs",
          value:
            "`!modrole add @role` — Ajouter un rôle\n`!modrole remove @role` — Retirer un rôle\n`!modrole list` — Lister les rôles",
          inline: false,
        },
        {
          name: "🎭 Attribution de rôles (Whitelist)",
          value:
            "`!giverole @user @role` — Donner un rôle\n`!takerole @user @role` — Retirer un rôle",
          inline: false,
        },
        {
          name: "📢 Module Messages (Whitelist)",
          value:
            "`!say #salon message` — Envoyer un message\n`!embed #salon Titre | Description` — Envoyer un embed",
          inline: false,
        },
        {
          name: "📌 Ping Owners",
          value: "Mentionnez le bot → ping automatique de tous les owners",
          inline: false,
        },
        {
          name: "⚙️ Configuration (Owners)",
          value: "`!setlog #salon` — Salon de log\n`!config` — Voir la config",
          inline: false,
        }
      )
      .setFooter({ text: `Préfixe : ${cfg.prefix}` });
    return message.reply({ embeds: [embed] });
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
      return message.reply({ embeds: [embedError("Mentionnez un utilisateur. Ex: `!setowner @user`")] });
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
      return message.reply({ embeds: [embedError("Usage : `!whitelist add/remove/list @user`")] });
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
      return message.reply({ embeds: [embedError("Usage : `!modrole add/remove/list @role`")] });
    }
  }

  // ── !giverole ──────────────────────────────────────────────────────────────
  if (command === "giverole") {
    if (!isWhitelisted(message.author.id))
      return message.reply({ embeds: [embedError("Vous n'êtes pas dans la whitelist.")] });
    const member = message.mentions.members.first();
    const role = message.mentions.roles.first();
    if (!member || !role)
      return message.reply({ embeds: [embedError("Usage : `!giverole @user @role`")] });
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
      return message.reply({ embeds: [embedError("Usage : `!takerole @user @role`")] });
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

  // ── !say ───────────────────────────────────────────────────────────────────
  if (command === "say") {
    if (!isWhitelisted(message.author.id))
      return message.reply({ embeds: [embedError("Accès refusé.")] });
    const channel = message.mentions.channels.first();
    const content = args.slice(1).join(" "); // skip the channel mention
    if (!channel || !content)
      return message.reply({ embeds: [embedError("Usage : `!say #salon votre message`")] });
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
      return message.reply({ embeds: [embedError("Usage : `!embed #salon Titre | Description`")] });
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
      embeds: [embedError("Seuls les owners peuvent ouvrir le panel.")]
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
});

// ─── Lancement ────────────────────────────────────────────────────────────────
const token = process.env.DISCORD_TOKEN;
if (!token) {
  console.error("❌ DISCORD_TOKEN manquant. Définissez la variable d'environnement DISCORD_TOKEN.");
  process.exit(1);
}

client.on("interactionCreate", async (interaction) => {

  if (interaction.isButton()) {

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
      label: `!${cmd}`,
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
          return `• !${cmd} → ${role ? role.name : "Rôle supprimé"}`;
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

      const commandName = interaction.guild.roles.cache
  .get(roleId)
  .name
  .toLowerCase()
  .replace(/\s+/g, "_");

addCustomRole(commandName, roleId);

      return interaction.reply({
        content: `✅ Commande créée : !${interaction.guild.roles.cache.get(roleId).name.toLowerCase()}`,
        ephemeral: true
      });

    }
if (interaction.customId === "customrole_delete_select") {

  const commandName = interaction.values[0];

  removeCustomRole(commandName);

  return interaction.reply({
    content: `✅ La commande !${commandName} a été supprimée.`,
    ephemeral: true
  });

}
  }

if (interaction.isModalSubmit()) {

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
      content: `✅ Commande créée : !${commandName}`,
      ephemeral: true
    });

  }

}

});
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

client.login(token);
