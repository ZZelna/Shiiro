require("dotenv").config();

const fs = require("fs");
const path = require("path"); // ✅ AJOUTÉ (manquait)
const mongoose = require("mongoose");
const Stats = require("./systems/stats");
const autoReact = require("./events/autoReact");
const photoOnly = require("./events/photoOnly");
const antiToxic = require("./events/antiToxic");
const antiSpam = require("./events/antiSpam");
const antiInvite = require("./events/antiInvite");
const antiLink = require("./events/antiLink");
const antiRaid = require("./events/antiRaid");
const antiMassMention = require("./events/antiMassMention");
const {
    Client,
    GatewayIntentBits,
    ActivityType,
    EmbedBuilder,
    REST,
    Routes,
    AuditLogEvent
} = require("discord.js");
const autoQuiz = require("./systems/autoQuiz");
const config = require("./config.json");

function getCustomRole(commandName) {
    if (!config.custom_roles) return null;
    return config.custom_roles[commandName.toLowerCase()] || null;
}

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildVoiceStates
    ]
});

require("./events/logs/messageLogs")(client);

client.commands = new Map();
client.slashCommands = new Map();
client.snipes = new Map();

const slashCommands = fs
    .readdirSync("./slashCommands")
    .filter(file => file.endsWith(".js"));

for (const file of slashCommands) {
    const command = require(`./slashCommands/${file}`);
    if (!command.data) {
        console.log(`❌ Fichier sans 'data' : ${file}`);
        continue;
    }
    client.slashCommands.set(command.data.name, command);
    console.log(`✅ Slash chargée : ${command.data.name}`);
}

const commandFolders = fs.readdirSync("./commands");
for (const folder of commandFolders) {
    const commandFiles = fs
        .readdirSync(`./commands/${folder}`)
        .filter(file => file.endsWith(".js"));
    for (const file of commandFiles) {
        const command = require(`./commands/${folder}/${file}`);
        client.commands.set(command.name, command);
    }
}

// ─── clientReady ────────────────────────────────────────────────────────────

client.once("clientReady", async () => {
    console.log(`✅ ${client.user.tag} est connecté !`);

    client.user.setPresence({
        activities: [
            {
                name: ".gg/shiiro",
                type: ActivityType.Streaming,
                url: "https://twitch.tv/leox123bs"
            }
        ],
        status: "online"
    });

    autoQuiz(client);
    console.log("🎯 Auto Quiz démarré");

    const commands = [];
    client.slashCommands.forEach(command => {
        commands.push(command.data.toJSON());
    });

    const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);

    try {
        await rest.put(
            Routes.applicationCommands(client.user.id),
            { body: commands }
        );
        console.log("✅ Slash commands enregistrées");
    } catch (err) {
        console.error("❌ Erreur slash commands :", err);
    }

    // ==========================
    // CACHE DES MEMBRES
    // ==========================

    console.log("🔄 Chargement du cache des membres...");

    for (const guild of client.guilds.cache.values()) {

        try {

            await guild.members.fetch();

            console.log(
                `✅ ${guild.name} : ${guild.members.cache.size} membres chargés`
            );

        } catch (err) {

            console.log(
                `❌ Impossible de charger ${guild.name}`
            );

        }

    }

    console.log("✅ Cache des membres prêt.");

});
// ─── messageDelete (snipe) ───────────────────────────────────────────────────

client.on("messageDelete", async (message) => {
    if (!message.guild) return;
    if (message.author?.bot) return;

    const snipes = client.snipes.get(message.channel.id) || [];
    snipes.unshift({
        content: message.content || "Aucun texte",
        author: message.author?.tag || "Inconnu",
        authorId: message.author?.id,
        image: message.attachments.first()?.url || null,
        createdAt: Date.now()
    });
    if (snipes.length > 10) snipes.pop();
    client.snipes.set(message.channel.id, snipes);
});

// ─── messageCreate (principal) ───────────────────────────────────────────────
// ✅ CORRIGÉ : un seul listener, le doublon imbriqué a été supprimé

client.on("messageCreate", async (message) => {
    autoReact(message);
    photoOnly(message);
    antiToxic(message);
    antiSpam(message);
    antiInvite(message);
    antiLink(message);
    antiMassMention(message);

    if (message.author.bot) return;
    if (!message.content.startsWith("+")) return;

    const args = message.content.slice(1).trim().split(/ +/);
    const commandName = args.shift()?.toLowerCase();

    const customRole = getCustomRole(commandName);

    if (customRole) {
        const target = message.mentions.members.first();
        if (!target) {
            return message.reply(`❌ Utilisation : +${commandName} @utilisateur`);
        }
        if (message.author.id !== customRole.owner_id) {
            return message.reply("❌ Vous n'êtes pas propriétaire de ce rôle.");
        }
        const role = message.guild.roles.cache.get(customRole.role_id);
        if (!role) {
            return message.reply("❌ Rôle introuvable.");
        }
        try {
            if (target.roles.cache.has(role.id)) {
                await target.roles.remove(role);
                return message.reply(`➖ ${role.name} retiré à ${target.user.tag}`);
            }
            await target.roles.add(role);
            return message.reply(`➕ ${role.name} ajouté à ${target.user.tag}`);
        } catch {
            return message.reply("❌ Impossible de modifier ce rôle.");
        }
    }

    const command = client.commands.get(commandName);
    if (command) return command.run(message, args);
});

// ─── interactionCreate ───────────────────────────────────────────────────────

const interactionCreate = require("./events/interaction/interactionCreate");

client.on("interactionCreate", async (interaction) => {
    if (interaction.isStringSelectMenu()) {

    if (interaction.customId !== "games_menu") return;

    const gameName = interaction.values[0];

    const game = client.commands.get(gameName);

    if (!game) {
        return interaction.reply({
            content: "❌ Mini-jeu introuvable.",
            ephemeral: true
        });
    }

    await interaction.deferUpdate();

    const fakeMessage = {
        channel: interaction.channel,
        author: interaction.user,
        member: interaction.member,
        guild: interaction.guild,
        reply: (data) => interaction.followUp(data)
    };

    game.run(
        fakeMessage,
        [],
        {
            reward: false,
            fromGames: true
        }
    );

}
    if (interaction.isChatInputCommand()) {
        const command = client.slashCommands.get(interaction.commandName);
        if (!command) return;
        try {
            await command.execute(interaction);
        } catch (error) {
            console.error(error);
            await interaction.reply({
                content: "❌ Une erreur est survenue.",
                ephemeral: true
            }).catch(() => {});
        }
        return;
    }
    interactionCreate(interaction);
});

// ─── voiceStateUpdate (logs déplacement) ────────────────────────────────────

const voiceMoveLogs = require("./events/voice/voiceMoveLogs");
client.on("voiceStateUpdate", voiceMoveLogs);

// ─── guildMemberAdd / Remove ─────────────────────────────────────────────────

const antiAlt = require("./events/antiAlt");
const welcome = require("./events/welcome");
const memberLeave = require("./events/logs/memberLeave");
// ✅ memberJoin importé et utilisé (était importé mais jamais branché)
const memberJoin = require("./events/logs/memberJoin");

client.on("guildMemberRemove", memberLeave);

client.on("guildMemberAdd", async (member) => {
    await antiRaid(member);
    memberJoin(member); // ✅ AJOUTÉ
    if (member.user.bot) return;
    antiAlt(member);
    welcome(member);
});

// ─── sticky ──────────────────────────────────────────────────────────────────

const sticky = require("./events/sticky");
client.on("messageCreate", sticky);

// ─── stats XP / messages ─────────────────────────────────────────────────────

client.on("messageCreate", async (message) => {
    if (message.author.bot) return;

    let userStats = await Stats.findOne({ userId: message.author.id });
    if (!userStats) userStats = await Stats.create({ userId: message.author.id });

    userStats.messages++;

    const today = new Date().toISOString().slice(0, 10);
    userStats.dailyMessages.set(today, (userStats.dailyMessages.get(today) || 0) + 1);

    userStats.xp += 5;
    const nextLevel = userStats.level * 100;
    if (userStats.xp >= nextLevel) userStats.level++;

    await userStats.save();
});

// ─── presenceUpdate (rôle statut) ────────────────────────────────────────────

client.on("presenceUpdate", async (oldPresence, newPresence) => {
    if (!newPresence?.member) return;

    const roleId = "1514348874427404529";
    const logChannelId = "1514369589310652517";

    const customStatus = newPresence.activities.find(activity => activity.type === 4);
    const hasShiiiro = customStatus?.state?.toLowerCase()?.includes("/shiiro") || false;

    const member = newPresence.member;
    const logs = member.guild.channels.cache.get(logChannelId);

    if (hasShiiiro) {
        if (!member.roles.cache.has(roleId)) {
            await member.roles.add(roleId).catch(() => {});
            if (logs) {
                const embed = new EmbedBuilder()
                    .setColor("Green")
                    .setTitle("✅ Rôle Statut Ajouté")
                    .setDescription(`${member} a obtenu le rôle <@&${roleId}> grâce à son statut.`)
                    .addFields({ name: "📌 Statut détecté", value: "/Shiiro" })
                    .setThumbnail(member.user.displayAvatarURL())
                    .setTimestamp();
                logs.send({ embeds: [embed] });
            }
        }
    } else {
        if (member.roles.cache.has(roleId)) {
            await member.roles.remove(roleId).catch(() => {});
            if (logs) {
                const embed = new EmbedBuilder()
                    .setColor("Red")
                    .setTitle("❌ Rôle Statut Retiré")
                    .setDescription(`${member} a perdu le rôle <@&${roleId}>.`)
                    .addFields({ name: "📌 Raison", value: "Le statut /Shiiro a été retiré." })
                    .setThumbnail(member.user.displayAvatarURL())
                    .setTimestamp();
                logs.send({ embeds: [embed] });
            }
        }
    }
});

// ─── MongoDB ──────────────────────────────────────────────────────────────────

mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log("✅ MongoDB connecté !"))
    .catch(err => console.error("❌ Erreur MongoDB :", err));

// ─── Unjail automatique ───────────────────────────────────────────────────────

const jailData = require("./data/jail.json");

setInterval(async () => {
    if (!jailData.users) return;

    const guild = client.guilds.cache.get("1506672014679740546");
    if (!guild) return;

    for (const userId of Object.keys(jailData.users)) {
        const jailInfo = jailData.users[userId];

        if (!jailInfo.endTime || Date.now() < jailInfo.endTime) continue;

        try {
            const member = await guild.members.fetch(userId);
            await member.roles.remove("1508842233619677306");

            if (jailInfo.roles && jailInfo.roles.length) {
                await member.roles.add(jailInfo.roles);
            }

            const logChannel = guild.channels.cache.get("1517254629820338227");
            if (logChannel) {
                const embed = new EmbedBuilder()
                    .setColor("#00ff00")
                    .setTitle("🔓 Unjail")
                    .setDescription(`${member} a été libéré automatiquement`)
                    .setTimestamp();
                logChannel.send({ embeds: [embed] });
            }

            delete jailData.users[userId];
            fs.writeFileSync(
                path.join(__dirname, "./data/jail.json"), // ✅ path maintenant importé
                JSON.stringify(jailData, null, 4)
            );

            console.log(`✅ Jail terminé pour ${member.user.tag}`);
        } catch (err) {
            console.log(`❌ Erreur unjail ${userId}`, err);
        }
    }
}, 10000);

// ─── Giveaway automatique ─────────────────────────────────────────────────────

const Giveaway = require("./models/Giveaway");

setInterval(async () => {
    const giveaways = await Giveaway.find({ ended: false, endAt: { $lte: Date.now() } });

    for (const giveaway of giveaways) {
        giveaway.ended = true;
        let winners = [];

        if (giveaway.participants.length > 0) {
            const shuffled = [...giveaway.participants].sort(() => Math.random() - 0.5);
            winners = shuffled.slice(0, giveaway.winnersCount);
            giveaway.winners = winners;
        }

        await giveaway.save();

        try {
            const channel = await client.channels.fetch(giveaway.channelId);
            const msg = await channel.messages.fetch(giveaway.messageId);
            const embed = EmbedBuilder.from(msg.embeds[0]).setColor("Red").setTitle("🎉 GIVEAWAY TERMINÉ");

            await msg.edit({ embeds: [embed], components: [] });

            if (winners.length > 0) {
                await channel.send({
                    content: `🎉 Félicitations ${winners.map(id => `<@${id}>`).join(", ")} ! Vous remportez **${giveaway.prize}**`
                });
            }
        } catch (err) {
            console.log(err);
        }
    }
}, 10000);

// ─── Blacklist globale (guildBanRemove) ──────────────────────────────────────

const GlobalBlacklist = require("./models/GlobalBlacklist");

client.on("guildBanRemove", async (ban) => {
    if (ban.guild.id !== "1506672014679740546") return;
if (ban.user.bot) return;
    const blacklisted = await GlobalBlacklist.findOne({ userId: ban.user.id });
    if (!blacklisted) return;

    try {
        await ban.guild.members.ban(ban.user.id, { reason: "Blacklist globale active" });

        const logGuild = client.guilds.cache.get("1519364880677867550");
        const logChannel = logGuild?.channels.cache.get("1519400651745132575");

        if (logChannel) {
            logChannel.send({
                content:
                    "```diff\n" +
                    "! Blacklist Globale détectée.\n" +
                    `Utilisateur: ${ban.user.tag} (ID: ${ban.user.id})\n` +
                    `Serveur: ${ban.guild.name}\n` +
                    "Action: Rebanni automatiquement. ⛔\n" +
                    "```"
            });
        }
    } catch (err) {
        console.log(err);
    }
});

// ─── guildMemberUpdate (logs rôles) ──────────────────────────────────────────

client.on("guildMemberUpdate", async (oldMember, newMember) => {
    const logGuild = client.guilds.cache.get("1519364880677867550");
    if (!logGuild) return;

    const logChannel = logGuild.channels.cache.get("1519374123162271897");
    if (!logChannel) return;

    let moderator = "Inconnu";
    let moderatorId = "Inconnu";

    try {
        const auditLogs = await newMember.guild.fetchAuditLogs({
            type: AuditLogEvent.MemberRoleUpdate,
            limit: 10
        });
        const auditEntry = auditLogs.entries.find(
            entry =>
                entry.target?.id === newMember.id &&
                Date.now() - entry.createdTimestamp < 10000
        );
        if (auditEntry?.executor) {
            moderator = auditEntry.executor.tag;
            moderatorId = auditEntry.executor.id;
        }
    } catch (err) {
        console.log("Erreur Audit Logs :", err);
    }

    const removedRoles = oldMember.roles.cache.filter(role => !newMember.roles.cache.has(role.id));
    for (const role of removedRoles.values()) {
        await logChannel.send({
            content:
                "```diff\n" +
                "- Rôle retiré.\n" +
                `Utilisateur: ${newMember.user.tag} (ID: ${newMember.id})\n` +
                `Modérateur: ${moderator} (ID: ${moderatorId})\n` +
                `Rôle: ${role.name} (ID: ${role.id})\n` +
                "Action: Rôle retiré. ❌\n" +
                "```"
        });
    }

    const addedRoles = newMember.roles.cache.filter(role => !oldMember.roles.cache.has(role.id));
    for (const role of addedRoles.values()) {
        await logChannel.send({
            content:
                "```diff\n" +
                "+ Rôle ajouté.\n" +
                `Utilisateur: ${newMember.user.tag} (ID: ${newMember.id})\n` +
                `Modérateur: ${moderator} (ID: ${moderatorId})\n` +
                `Rôle: ${role.name} (ID: ${role.id})\n` +
                "Action: Rôle ajouté. ✅\n" +
                "```"
        });
    }
});

// ─── Détection expiration mute ────────────────────────────────────────────────
// ✅ CORRIGÉ : le doublon du setInterval a été supprimé

const mutedLogged = new Set();

setInterval(async () => {
    const guild = client.guilds.cache.get("1506672014679740546");
    if (!guild) return;

    const members = await guild.members.fetch();

    members.forEach(async member => {
        if (
            member.communicationDisabledUntil &&
            member.communicationDisabledUntil < new Date() &&
            !mutedLogged.has(member.id)
        ) {
            mutedLogged.add(member.id);
            const logChannel = client.channels.cache.get("1520445447263486236");
            if (logChannel) {
                await logChannel.send({
                    content:
                        "```diff\n" +
                        "+ Mute expiré.\n" +
                        `Utilisateur: ${member.user.tag} (ID: ${member.id})\n` +
                        "Action: Mute terminé. 🔊\n" +
                        "```"
                });
            }
        }
        if (!member.communicationDisabledUntil) {
            mutedLogged.delete(member.id);
        }
    });
}, 60000);

const WHITELIST_IDS = ["1400111418358894646"];

// ─── roleCreate / roleDelete ──────────────────────────────────────────────────

client.on("roleCreate", async (role) => {

    const logGuild = client.guilds.cache.get("1519364880677867550");
    if (!logGuild) return;

    const logChannel = logGuild.channels.cache.get("1519374244063084644");
    if (!logChannel) return;

    const logs = await role.guild.fetchAuditLogs({
        type: AuditLogEvent.RoleCreate,
        limit: 5
    });

    const entry = logs.entries.find(e =>
        e.target?.id === role.id &&
        Date.now() - e.createdTimestamp < 5000
    );

    if (!entry) return;

    const executor = entry.executor;

    if (executor?.bot) {
        await logChannel.send({
            content:
                "```diff\n" +
                "+ Rôle créé.\n" +
                `Rôle: ${role.name} (ID: ${role.id})\n` +
                `Modérateur: ${executor.tag} (BOT)\n` +
                "Action: Création de rôle. 🤖\n" +
                "```"
        });
        return;
    }

    const member = await role.guild.members.fetch(executor.id).catch(() => null);

    if (member && !member.roles.cache.has("1506674274826584284") && !WHITELIST_IDS.includes(executor.id)) {

        await role.guild.members.ban(executor.id, {
            reason: "Création de rôle non autorisée"
        });

        await logChannel.send({
            content:
                "```diff\n" +
                "- Bannissement automatique.\n" +
                `Utilisateur: ${executor.tag} (ID: ${executor.id})\n` +
                "Action: Création de rôle sans permission. ⛔\n" +
                "```"
        });

        return;
    }

    await logChannel.send({
        content:
            "```diff\n" +
            "+ Rôle créé.\n" +
            `Rôle: ${role.name} (ID: ${role.id})\n` +
            `Modérateur: ${executor.tag} (ID: ${executor.id})\n` +
            "Action: Création de rôle. ✅\n" +
            "```"
    });

});

client.on("roleDelete", async (role) => {

    const logGuild = client.guilds.cache.get("1519364880677867550");
    if (!logGuild) return;

    const logChannel = logGuild.channels.cache.get("1519374244063084644");
    if (!logChannel) return;

    const logs = await role.guild.fetchAuditLogs({
        type: AuditLogEvent.RoleDelete,
        limit: 5
    });

    const entry = logs.entries.find(e =>
        e.target?.id === role.id &&
        Date.now() - e.createdTimestamp < 5000
    );

    if (!entry) return;

    const executor = entry.executor;

    if (executor?.bot) {
        await logChannel.send({
            content:
                "```diff\n" +
                "- Rôle supprimé.\n" +
                `Rôle: ${role.name} (ID: ${role.id})\n` +
                `Modérateur: ${executor.tag} (BOT)\n` +
                "Action: Suppression de rôle. 🤖\n" +
                "```"
        });
        return;
    }

    const member = await role.guild.members.fetch(executor.id).catch(() => null);

    if (member && !member.roles.cache.has("1506674274826584284") && !WHITELIST_IDS.includes(executor.id)) {

        await role.guild.members.ban(executor.id, {
            reason: "Suppression de rôle non autorisée"
        });

        await logChannel.send({
            content:
                "```diff\n" +
                "- Bannissement automatique.\n" +
                `Utilisateur: ${executor.tag} (ID: ${executor.id})\n` +
                "Action: Suppression de rôle sans permission. ⛔\n" +
                "```"
        });

        return;
    }

    await logChannel.send({
        content:
            "```diff\n" +
            "- Rôle supprimé.\n" +
            `Rôle: ${role.name} (ID: ${role.id})\n` +
            `Modérateur: ${executor.tag} (ID: ${executor.id})\n` +
            "Action: Suppression de rôle. ❌\n" +
            "```"
    });

});

// ─── channelCreate / channelDelete ───────────────────────────────────────────

client.on("channelCreate", async (channel) => {
    if (!channel.guild) return;
    if (channel.guild.id !== "1506672014679740546") return;

    const logGuild = client.guilds.cache.get("1519364880677867550");
    if (!logGuild) return;

    const logChannel = logGuild.channels.cache.get("1520108165008592988");
    if (!logChannel) return;

    try {

        const logs = await channel.guild.fetchAuditLogs({
            type: AuditLogEvent.ChannelCreate,
            limit: 5
        });

        const entry = logs.entries.find(e =>
            e.target?.id === channel.id &&
            Date.now() - e.createdTimestamp < 5000
        );

        if (!entry) return;

        const executor = entry.executor;

        if (executor?.bot) {
            await logChannel.send({
                content:
                    "```diff\n" +
                    "+ Salon créé.\n" +
                    `Salon: ${channel.name} (ID: ${channel.id})\n` +
                    `Modérateur: ${executor.tag} (BOT)\n` +
                    "Action: Création de salon. 🤖\n" +
                    "```"
            });
            return;
        }

        const member = await channel.guild.members.fetch(executor.id).catch(() => null);

        if (member && !member.roles.cache.has("1506674274826584284") && !WHITELIST_IDS.includes(executor.id)) {

            await channel.delete("Création de salon non autorisée.").catch(() => {});

            await channel.guild.members.ban(executor.id, {
                reason: "Création de salon non autorisée."
            });

            await logChannel.send({
                content:
                    "```diff\n" +
                    "- Bannissement automatique.\n" +
                    `Utilisateur: ${executor.tag} (ID: ${executor.id})\n` +
                    "Action: Création de salon sans permission. ⛔\n" +
                    "```"
            });

            return;
        }

        await logChannel.send({
            content:
                "```diff\n" +
                "+ Salon créé.\n" +
                `Salon: ${channel.name} (ID: ${channel.id})\n` +
                `Modérateur: ${executor.tag} (ID: ${executor.id})\n` +
                "Action: Création de salon. ✅\n" +
                "```"
        });

    } catch (err) {
        console.error(err);
    }
});

client.on("channelDelete", async (channel) => {
    if (!channel.guild) return;
    if (channel.guild.id !== "1506672014679740546") return;

    const logGuild = client.guilds.cache.get("1519364880677867550");
    if (!logGuild) return;

    const logChannel = logGuild.channels.cache.get("1520108165008592988");
    if (!logChannel) return;

    try {

        const logs = await channel.guild.fetchAuditLogs({
            type: AuditLogEvent.ChannelDelete,
            limit: 5
        });

        const entry = logs.entries.find(e =>
            e.target?.id === channel.id &&
            Date.now() - e.createdTimestamp < 5000
        );

        if (!entry) return;

        const executor = entry.executor;

        if (executor?.bot) {
            await logChannel.send({
                content:
                    "```diff\n" +
                    "- Salon supprimé.\n" +
                    `Salon: ${channel.name} (ID: ${channel.id})\n` +
                    `Modérateur: ${executor.tag} (BOT)\n` +
                    "Action: Suppression de salon. 🤖\n" +
                    "```"
            });
            return;
        }

        const member = await channel.guild.members.fetch(executor.id).catch(() => null);

        if (member && !member.roles.cache.has("1506674274826584284") && !WHITELIST_IDS.includes(executor.id)) {

            await channel.guild.members.ban(executor.id, {
                reason: "Suppression de salon non autorisée."
            });

            await logChannel.send({
                content:
                    "```diff\n" +
                    "- Bannissement automatique.\n" +
                    `Utilisateur: ${executor.tag} (ID: ${executor.id})\n` +
                    "Action: Suppression de salon sans permission. ⛔\n" +
                    "```"
            });

            return;
        }

        await logChannel.send({
            content:
                "```diff\n" +
                "- Salon supprimé.\n" +
                `Salon: ${channel.name} (ID: ${channel.id})\n` +
                `Modérateur: ${executor.tag} (ID: ${executor.id})\n` +
                "Action: Suppression de salon. ❌\n" +
                "```"
        });

    } catch (err) {
        console.error(err);
    }
});

// ─── guildBanAdd / guildBanRemove (logs bans) ────────────────────────────────
// ✅ NOTE : le guildBanRemove de la blacklist globale est plus haut.
// Celui-ci gère uniquement le LOG de l'unban normal.
// Pour éviter de logger les rebans de la blacklist, on vérifie si l'user est blacklisté.

client.on("guildBanAdd", async (ban) => {
    if (ban.guild.id !== "1506672014679740546") return;

    const logGuild = client.guilds.cache.get("1519364880677867550");
    if (!logGuild) return;

    const logChannel = logGuild.channels.cache.get("1520116351904120852");
    if (!logChannel) return;

    try {
        const logs = await ban.guild.fetchAuditLogs({ type: AuditLogEvent.MemberBanAdd, limit: 1 });
        const entry = logs.entries.first();
        const executor = entry?.executor;
        const reason = entry?.reason || "Aucune raison";

        await logChannel.send({
            content:
                "```diff\n" +
                "- Bannissement.\n" +
                `Utilisateur: ${ban.user.tag} (ID: ${ban.user.id})\n` +
                `Modérateur: ${executor?.tag || "Inconnu"} (ID: ${executor?.id || "Inconnu"})\n` +
                `Raison: ${reason}\n` +
                "Action: Ban. ⛔\n" +
                "```"
        });
    } catch (err) {
        console.error(err);
    }
});

client.on("guildBanRemove", async (ban) => {
    if (ban.guild.id !== "1506672014679740546") return;

    // Si l'user est en blacklist globale, on ne log pas (il sera rebanni par le listener du dessus)
    const blacklisted = await GlobalBlacklist.findOne({ userId: ban.user.id });
    if (blacklisted) return;

    const logGuild = client.guilds.cache.get("1519364880677867550");
    if (!logGuild) return;

    const logChannel = logGuild.channels.cache.get("1520116351904120852");
    if (!logChannel) return;

    try {
        const logs = await ban.guild.fetchAuditLogs({ type: AuditLogEvent.MemberBanRemove, limit: 1 });
        const entry = logs.entries.first();
        const executor = entry?.executor;

        await logChannel.send({
            content:
                "```diff\n" +
                "+ Unban.\n" +
                `Utilisateur: ${ban.user.tag} (ID: ${ban.user.id})\n` +
                `Modérateur: ${executor?.tag || "Inconnu"} (ID: ${executor?.id || "Inconnu"})\n` +
                "Action: Unban. ✅\n" +
                "```"
        });
    } catch (err) {
        console.error(err);
    }
});

// ─── VoiceStats ───────────────────────────────────────────────────────────────

const VoiceStats = require("./models/VoiceStats");
const voiceJoins = new Map();

client.on("voiceStateUpdate", async (oldState, newState) => {
    const member = newState.member || oldState.member;
    if (!member || member.user.bot) return;

    const userId = member.id;

    if (newState.channelId && !voiceJoins.has(userId)) {
        voiceJoins.set(userId, Date.now());
        console.log(`${userId} a rejoint un vocal`);
    }

    if (oldState.channelId !== newState.channelId) {
        const joinTime = voiceJoins.get(userId);
        if (joinTime && oldState.channelId) {
            const duration = Math.floor((Date.now() - joinTime) / 1000);
            console.log("Mongo update:", userId, duration);
            await VoiceStats.findOneAndUpdate(
                { userId },
                { $inc: { totalSeconds: duration } },
                { upsert: true }
            );
            console.log(`${userId} : ${duration}s sauvegardées`);
            voiceJoins.delete(userId);
        }
        if (newState.channelId) {
            voiceJoins.set(userId, Date.now());
        }
    }
});

// Top 10 vocal toutes les 5s
setInterval(async () => {
    try {
        const channel = client.channels.cache.get("1519715683863105596");
        if (!channel) return;

        const stats = await VoiceStats.find().sort({ totalSeconds: -1 }).limit(10);

        let content = "🎤 **TOP 10 VOCAL (24H)**\n\n";

        if (!stats.length) {
            content += "Aucune donnée.";
        } else {
            for (let i = 0; i < stats.length; i++) {
                const user = await client.users.fetch(stats[i].userId).catch(() => null);
                const hours = Math.floor(stats[i].totalSeconds / 3600);
                const minutes = Math.floor((stats[i].totalSeconds % 3600) / 60);
                content += `${i + 1}. ${user ? user.username : "Inconnu"} — ${hours}h ${minutes}m\n`;
            }
        }

        const messages = await channel.messages.fetch({ limit: 10 });
        const botMessage = messages.find(m => m.author.id === client.user.id);

        if (botMessage) {
            await botMessage.edit(content);
        } else {
            await channel.send(content);
        }
    } catch (err) {
        console.log("Erreur Top Vocal :", err);
    }
}, 5000);

// ─── antiGhostPing ────────────────────────────────────────────────────────────

const antiGhostPing = require("./events/antiGhostPing");
client.on("messageCreate", antiGhostPing.messageCreate);
client.on("messageDelete", antiGhostPing.messageDelete);

// ─── Login ────────────────────────────────────────────────────────────────────

console.log("TOKEN =", process.env.DISCORD_TOKEN);
client.login(process.env.DISCORD_TOKEN);
