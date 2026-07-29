require("dotenv").config();

const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");

// ─── Events / Systems (requis une seule fois, en haut) ───────────────────────
const statsVoice = require("./events/ready/statsVoice");
const Stats = require("./systems/stats");
const autoReact = require("./events/autoReact");
const photoOnly = require("./events/photoOnly");
const antiToxic = require("./events/antiToxic");
const antiSpam = require("./events/antiSpam");
const antiInvite = require("./events/antiInvite");
const antiLink = require("./events/antiLink");
const antiRaid = require("./events/antiRaid");
const antiMassMention = require("./events/antiMassMention");
const antiGhostPing = require("./events/antiGhostPing");
const antiAlt = require("./events/antiAlt");
const welcome = require("./events/welcome");
const memberLeave = require("./events/logs/memberLeave");
const memberJoin = require("./events/logs/memberJoin");
const sticky = require("./events/sticky");
const ai = require("./events/ai");
const ready = require("./events/client/ready");
const interactionCreate = require("./events/interactionCreate");
const voiceMoveLogs = require("./events/voice/voiceMoveLogs");
const tempVoice = require("./events/voiceStateUpdate");
const tiktokNotifier = require("./systems/tiktokNotifier");
const economyRewards = require("./systems/economyRewards");
const autoQuiz = require("./systems/autoQuiz");
const Confession = require("./models/Confession");
const { buildConfessionContainer } = require("./events/confession");
const Giveaway = require("./models/Giveaway");
const GlobalBlacklist = require("./models/GlobalBlacklist");
const VoiceStats = require("./models/VoiceStats");
const AutoRole = require("./models/AutoRole");
const handleCustomRoleGrant = require("./systems/customRoleGrant");
const { getShieldConfig } = require("./systems/shieldConfig");

const config = require("./config.json");

const {
    Client,
    GatewayIntentBits,
    EmbedBuilder,
    AuditLogEvent,
    ContainerBuilder,
    TextDisplayBuilder,
    MessageFlags
} = require("discord.js");

// ─── Constantes globales (remontées en haut, avant tout usage) ───────────────

const GUILD_ID = "1506672014679740546";
const LOG_GUILD_ID = "1519364880677867550";

const WHITELIST_IDS = ["1400111418358894646"];
const BYPASS_SERVER_INVITE = "https://discord.gg/FZqjCqMmXY";

const NEVER_REMOVABLE_ROLE_ID = "1506676284070170654";
const MANAGER_ROLE_ID = "1506678694352261301";
const BYPASS_ROLE_ID = "1506674274826584284";
const PROTECTED_ROLE_IDS = [
    "1506674274826584284",
    "1507029804568936530",
    "1506678023473201293",
    "1514287005981475010"
];
const ALLOWED_PROTECTED_ROLE_USER_ID = "1418370654251778168";
const ALLOWED_MOVE_ROLE_ID = "1506674274826584284";

const STATUS_ROLE_ID = "1514348874427404529";
const STATUS_LOG_CHANNEL_ID = "1514369589310652517";
const IMAGE_CHANNEL_ID = "1508491934547574814";

const ROLE_LOG_CHANNEL_ID = "1519374123162271897";
const ROLE_CREATE_DELETE_LOG_CHANNEL_ID = "1519374244063084644";
const CHANNEL_LOG_CHANNEL_ID = "1520108165008592988";
const BAN_LOG_CHANNEL_ID = "1520116351904120852";
const BLACKLIST_LOG_GUILD_ID = "1519364880677867550";
const BLACKLIST_LOG_CHANNEL_ID = "1519400651745132575";
const UNJAIL_LOG_CHANNEL_ID = "1517254629820338227";
const JAIL_ROLE_ID = "1508842233619677306";
const MUTE_EXPIRED_LOG_CHANNEL_ID = "1520445447263486236";
const VOICE_TOP_CHANNEL_ID = "1519715683863105596";

// Intervalles (regroupés ici pour pouvoir les ajuster facilement)
const JAIL_CHECK_INTERVAL_MS = 10_000;
const GIVEAWAY_CHECK_INTERVAL_MS = 10_000;
const MUTE_CHECK_INTERVAL_MS = 60_000;
// ⚡ passé de 5s à 30s : un top vocal n'a pas besoin d'être recalculé
// toutes les 5 secondes, ça évite une requête Mongo + jusqu'à 10 fetch
// utilisateur + un edit de message toutes les 5s en continu.
const VOICE_TOP_INTERVAL_MS = 30_000;

// ─── Sécurité process : évite qu'une erreur isolée ne crash tout le bot ──────
process.on("unhandledRejection", (err) => {
    console.error("❌ Unhandled Rejection :", err);
});
process.on("uncaughtException", (err) => {
    console.error("❌ Uncaught Exception :", err);
});

// ─── Client ────────────────────────────────────────────────────────────────

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildModeration,
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

// Snapshot en mémoire : roleId -> Set des memberId qui possèdent ce rôle.
// Sert à retrouver qui avait un rôle même si le cache Discord.js est déjà
// vidé au moment de l'event roleDelete.
const roleMemberSnapshot = new Map();

function snapshotAddMember(roleId, memberId) {
    if (!roleMemberSnapshot.has(roleId)) roleMemberSnapshot.set(roleId, new Set());
    roleMemberSnapshot.get(roleId).add(memberId);
}

function snapshotRemoveMember(roleId, memberId) {
    const set = roleMemberSnapshot.get(roleId);
    if (set) set.delete(memberId);
}

// ─── Chargement des commandes (avec try/catch : un fichier cassé ne doit
// pas empêcher le bot de démarrer) ────────────────────────────────────────

const slashCommands = fs
    .readdirSync("./slashCommands")
    .filter(file => file.endsWith(".js"));

for (const file of slashCommands) {
    try {
        const command = require(`./slashCommands/${file}`);
        if (!command.data) {
            console.log(`❌ Fichier sans 'data' : ${file}`);
            continue;
        }
        client.slashCommands.set(command.data.name, command);
        console.log(`✅ Slash chargée : ${command.data.name}`);
    } catch (err) {
        console.error(`❌ Erreur chargement slash ${file} :`, err);
    }
}

const commandFolders = fs.readdirSync("./commands");
for (const folder of commandFolders) {
    const commandFiles = fs
        .readdirSync(`./commands/${folder}`)
        .filter(file => file.endsWith(".js"));
    for (const file of commandFiles) {
        try {
            const command = require(`./commands/${folder}/${file}`);
            client.commands.set(command.name, command);
        } catch (err) {
            console.error(`❌ Erreur chargement commande ${folder}/${file} :`, err);
        }
    }
}

client.once("clientReady", () => {
    ready(client, snapshotAddMember);
});

// ─── messageDelete (snipe) ────────────────────────────────────────────────

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

client.on("messageDelete", antiGhostPing.messageDelete);

// ─── messageCreate (UN SEUL listener regroupant toute la logique) ───────────
// ⚡ Avant : 3 listeners "messageCreate" séparés (modération, confession/
// prefix commands, stats XP), plus antiGhostPing branché séparément.
// Les regrouper évite de parcourir 3 fois la queue d'événements pour
// chaque message et rend le flux beaucoup plus lisible.
// Les modules de modération indépendants (qui ne dépendent pas les uns
// des autres) tournent en parallèle via Promise.allSettled plutôt qu'en
// séquence bloquante.

client.on("messageCreate", async (message) => {
    // Modération / auto-modules indépendants : en parallèle, sans bloquer
    // la suite si un module plante.
    Promise.allSettled([
        ai(message),
        autoReact(message),
        photoOnly(message),
        antiToxic(message),
        antiSpam(message),
        antiInvite(message),
        antiLink(message),
        antiMassMention(message),
        antiGhostPing.messageCreate(message)
    ]).then(results => {
        results.forEach(r => {
            if (r.status === "rejected") console.error("❌ Erreur module modération :", r.reason);
        });
    });

    // sticky doit s'exécuter aussi pour les bots historiquement, on le garde tel quel
    sticky(message);

    if (message.author.bot) return;

    // ── Compteur de réponses Confession ──
    if (message.channel.isThread()) {
        try {
            const confession = await Confession.findOne({ threadId: message.channel.id });
            if (confession) {
                confession.replyCount = (confession.replyCount || 0) + 1;
                await confession.save();

                const confessionChannel = await message.guild.channels.fetch(confession.channelId);
                const confessionMessage = await confessionChannel.messages.fetch(confession.messageId);
                const container = buildConfessionContainer(confession, message.guild);

                await confessionMessage.edit({
                    components: [container],
                    flags: MessageFlags.IsComponentsV2
                });
            }
        } catch (err) {
            console.error("❌ Erreur mise à jour compteur confession :", err);
        }
    }

    // ── Stats XP / messages ──
    try {
        let userStats = await Stats.findOne({ userId: message.author.id });
        if (!userStats) userStats = await Stats.create({ userId: message.author.id });

        userStats.messages++;

        const today = new Date().toISOString().slice(0, 10);
        userStats.dailyMessages.set(today, (userStats.dailyMessages.get(today) || 0) + 1);

        userStats.xp += 5;
        // ⚡ CORRIGÉ : boucle while au lieu d'un simple if, pour gérer le
        // cas où plusieurs niveaux seraient franchis d'un coup (bonus XP,
        // rattrapage après downtime, etc.)
        while (userStats.xp >= userStats.level * 100) {
            userStats.level++;
        }

        await userStats.save();
    } catch (err) {
        console.error("❌ Erreur stats XP :", err);
    }

    // ── Commandes préfixées ──
    const prefixes = ["+", "!", "*", "?"];
    const prefix = prefixes.find(p => message.content.startsWith(p));
    if (!prefix) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift()?.toLowerCase();

    // Rôles perso partageables (base MongoDB) : +nomcommande @personne
    // Renvoie true si commandName correspondait à un rôle perso (traité, succès ou échec) ;
    // false si aucun rôle perso ne porte ce nom -> on continue vers les commandes classiques.
    const grantHandled = await handleCustomRoleGrant(message, commandName);
    if (grantHandled) return;

    const command = client.commands.get(commandName);
    if (command) return command.run(message, args);
});

// ─── interactionCreate ────────────────────────────────────────────────────

client.on("interactionCreate", async (interaction) => {
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

// ─── voiceStateUpdate (logs déplacement + temp voice) ────────────────────────

client.on("voiceStateUpdate", voiceMoveLogs);
client.on("voiceStateUpdate", tempVoice);

// ─── guildMemberAdd / Remove ─────────────────────────────────────────────────

client.on("guildMemberRemove", (member) => {
    for (const set of roleMemberSnapshot.values()) {
        set.delete(member.id);
    }
    memberLeave(member);
});

client.on("guildMemberAdd", async (member) => {
    await antiRaid(member);
    memberJoin(member);
    if (member.user.bot) return;
    antiAlt(member);
    welcome(member);

    // Auto-rôle (fusionné avec l'autre listener guildMemberAdd existant)
    try {
        const data = await AutoRole.findOne({ guildId: member.guild.id });
        if (!data) return;

        const role = member.guild.roles.cache.get(data.roleId);
        if (!role) return;

        await member.roles.add(role);
        snapshotAddMember(role.id, member.id);
    } catch (err) {
        console.log("❌ Erreur AutoRole :", err);
    }
});

// ─── presenceUpdate (rôle statut + perm images) ──────────────────────────────
// ⚡ Ajout d'une vérification en amont pour éviter des appels d'API Discord
// inutiles (permissionOverwrites.edit/delete) quand rien n'a changé.

client.on("presenceUpdate", async (oldPresence, newPresence) => {
    if (!newPresence?.member) return;

    const member = newPresence.member;
    const logs = member.guild.channels.cache.get(STATUS_LOG_CHANNEL_ID);
    const imageChannel = member.guild.channels.cache.get(IMAGE_CHANNEL_ID);

    const customStatus = newPresence.activities.find(activity => activity.type === 4);
    const hasShiiiro = customStatus?.state?.toLowerCase()?.includes("/shiiro") || false;

    const hasRole = member.roles.cache.has(STATUS_ROLE_ID);

    if (hasShiiiro) {
        if (!hasRole) {
            await member.roles.add(STATUS_ROLE_ID).catch(() => {});
            if (logs) {
                const embed = new EmbedBuilder()
                    .setColor("Green")
                    .setTitle("✅ Rôle Statut Ajouté")
                    .setDescription(`${member} a obtenu le rôle <@&${STATUS_ROLE_ID}> grâce à son statut.`)
                    .addFields({ name: "📌 Statut détecté", value: "/Shiiro" })
                    .setThumbnail(member.user.displayAvatarURL())
                    .setTimestamp();
                logs.send({ embeds: [embed] });
            }
        }

        if (imageChannel && imageChannel.permissionOverwrites.cache.has(member.id)) {
            await imageChannel.permissionOverwrites
                .delete(member.id, "Statut /Shiiro actif : accès images autorisé")
                .catch(() => {});
        }
    } else {
        if (hasRole) {
            await member.roles.remove(STATUS_ROLE_ID).catch(() => {});
            if (logs) {
                const embed = new EmbedBuilder()
                    .setColor("Red")
                    .setTitle("❌ Rôle Statut Retiré")
                    .setDescription(`${member} a perdu le rôle <@&${STATUS_ROLE_ID}>.`)
                    .addFields({ name: "📌 Raison", value: "Le statut /Shiiro a été retiré." })
                    .setThumbnail(member.user.displayAvatarURL())
                    .setTimestamp();
                logs.send({ embeds: [embed] });
            }
        }

        const existingOverwrite = imageChannel?.permissionOverwrites.cache.get(member.id);
        const alreadyRestricted = existingOverwrite &&
            existingOverwrite.deny.has("AttachFiles") &&
            existingOverwrite.deny.has("EmbedLinks");

        if (imageChannel && !alreadyRestricted) {
            await imageChannel.permissionOverwrites
                .edit(member.id, {
                    AttachFiles: false,
                    EmbedLinks: false
                }, { reason: "Pas de statut /Shiiro : accès images retiré" })
                .catch(() => {});
        }
    }
});

// ─── MongoDB ──────────────────────────────────────────────────────────────────

mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log("✅ MongoDB connecté !"))
    .catch(err => console.error("❌ Erreur MongoDB :", err));



// ─── Giveaway automatique ─────────────────────────────────────────────────────

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

            const emoji = giveaway.type === "casino"
                ? "<:casino:1507449727266979922>"
                : "<:nitro:1508097922489647234>";

            const endedContainer = new ContainerBuilder()
                .setAccentColor(0xED4245)
                .addTextDisplayComponents(
                    new TextDisplayBuilder().setContent("# 🎉 GIVEAWAY TERMINÉ")
                )
                .addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(
                        `**Lot :** ${giveaway.prize}\n` +
                        `${emoji} **${giveaway.participants.length}** participant(s)\n\n` +
                        (winners.length > 0
                            ? `🏆 **Gagnant(s) :** ${winners.map(id => `<@${id}>`).join(", ")}`
                            : "😔 Aucun gagnant (aucun participant).")
                    )
                );

            await msg.edit({
                components: [endedContainer],
                flags: MessageFlags.IsComponentsV2
            });

            if (winners.length > 0) {
                await channel.send({
                    content: `🎉 Félicitations ${winners.map(id => `<@${id}>`).join(", ")} ! Vous remportez **${giveaway.prize}**`
                });
            }
        } catch (err) {
            console.log(err);
        }
    }
}, GIVEAWAY_CHECK_INTERVAL_MS);

// ─── Blacklist globale (guildBanRemove) ──────────────────────────────────────

client.on("guildBanRemove", async (ban) => {
    console.log(`🔓 Unban détecté : ${ban.user.tag} (${ban.user.id})`);

    if (ban.guild.id !== GUILD_ID) return;
    if (ban.user.bot) return;

    const blacklisted = await GlobalBlacklist.findOne({ userId: ban.user.id });
    if (!blacklisted) {
        console.log("❌ L'utilisateur n'est pas dans la blacklist globale.");
        return;
    }

    console.log("✅ Utilisateur trouvé dans la blacklist.");
    await new Promise(resolve => setTimeout(resolve, 2000));

    try {
        await ban.guild.members.ban(ban.user.id, {
            reason: `[BL] ${blacklisted.reason}`
        });
        console.log(`⛔ ${ban.user.tag} a été rebanni automatiquement.`);

        const logGuild = client.guilds.cache.get(BLACKLIST_LOG_GUILD_ID);
        const logChannel = logGuild?.channels.cache.get(BLACKLIST_LOG_CHANNEL_ID);
        if (logChannel) {
            await logChannel.send({
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
        console.error("❌ Erreur lors du rebannissement :", err);
    }
});

// ─── guildMemberUpdate (logs rôles + protection) ─────────────────────────────

client.on("guildMemberUpdate", async (oldMember, newMember) => {
    const logGuild = client.guilds.cache.get(LOG_GUILD_ID);
    if (!logGuild) return;

    const logChannel = logGuild.channels.cache.get(ROLE_LOG_CHANNEL_ID);
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

    const managerRole = newMember.guild.roles.cache.get(MANAGER_ROLE_ID);

    // ⚡ On ne fetch l'executor que si on a un ID valide (évite un fetch
    // inutile quand moderatorId vaut encore "Inconnu")
    const executor = moderatorId !== "Inconnu"
        ? await newMember.guild.members.fetch(moderatorId).catch(() => null)
        : null;

    const roleRemoveConfig = await getShieldConfig(newMember.guild.id, "roleRemove");
    const roleAddConfig = await getShieldConfig(newMember.guild.id, "roleAdd");

    // ───── Rôles retirés ─────

    const removedRoles = oldMember.roles.cache.filter(
        role => !newMember.roles.cache.has(role.id)
    );

    if (roleRemoveConfig.enabled)
    for (const role of removedRoles.values()) {
        snapshotRemoveMember(role.id, newMember.id);

        if (role.id === NEVER_REMOVABLE_ROLE_ID) {
            // ⚡ Exception jail : si le membre est actuellement en train
            // d'être placé en prison (il a déjà le rôle jail), on ne
            // restaure PAS le rôle protégé, sinon /jail (et /securejail)
            // devient inopérant : le rôle de base réapparaît aussitôt.
            if (newMember.roles.cache.has(JAIL_ROLE_ID)) {
                continue;
            }

            try {
                await newMember.roles.add(role.id, "Rôle protégé : ré-ajout automatique");
            } catch (err) {
                console.log("❌ Impossible de ré-ajouter le rôle protégé :", err);
            }

            await logChannel.send({
                content:
                    "```diff\n" +
                    "! Tentative de retrait d'un rôle protégé.\n" +
                    `Utilisateur: ${newMember.user.tag} (ID: ${newMember.id})\n` +
                    `Modérateur: ${moderator} (ID: ${moderatorId})\n` +
                    `Rôle: ${role.name} (ID: ${role.id})\n` +
                    "Action: Rôle ré-attribué automatiquement, aucune exception autorisée. 🛡️\n" +
                    "```"
            });
            continue;
        }

        // ⚡ Exception bot : un retrait de rôle effectué par le bot lui-même
        // (jail, autorole, custom roles, etc.) ne doit jamais être traité
        // comme un contournement de hiérarchie par un humain.
        if (executor?.id === client.user.id) continue;

        if (
            managerRole &&
            role.position > managerRole.position &&
            executor &&
            !executor.roles.cache.has(BYPASS_ROLE_ID) &&
            !WHITELIST_IDS.includes(executor.id)
        ) {
            try {
                await newMember.roles.add(role.id, "Retrait non autorisé d'un rôle supérieur : ré-ajout automatique");
            } catch (err) {
                console.log("❌ Impossible de ré-ajouter le rôle :", err);
            }

            try {
                await newMember.guild.members.ban(executor.id, {
                    reason: "Retrait non autorisé d'un rôle supérieur à son niveau."
                });
            } catch (err) {
                console.log("❌ Échec du ban (retrait de rôle supérieur) :", err.message);
            }

            try {
                await executor.send(
                    `❌ Vous n'êtes pas autorisé à retirer le rôle **${role.name}**, il est au-dessus de votre niveau d'autorisation.\n` +
                    `Vous avez été banni. Pour faire appel : ${BYPASS_SERVER_INVITE}`
                );
            } catch {}

            await logChannel.send({
                content:
                    "```diff\n" +
                    "! Retrait non autorisé d'un rôle supérieur.\n" +
                    `Utilisateur: ${newMember.user.tag} (ID: ${newMember.id})\n` +
                    `Modérateur: ${moderator} (ID: ${moderatorId})\n` +
                    `Rôle: ${role.name} (ID: ${role.id})\n` +
                    "Action: Rôle ré-attribué, responsable banni. ⛔\n" +
                    `Lien serveur ban/bypass: ${BYPASS_SERVER_INVITE}\n` +
                    "```"
            });
            continue;
        }

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

    // ───── Rôles ajoutés ─────

    const addedRoles = newMember.roles.cache.filter(
        role => !oldMember.roles.cache.has(role.id)
    );

    if (roleAddConfig.enabled)
    for (const role of addedRoles.values()) {
        snapshotAddMember(role.id, newMember.id);

        // ⚡ Exception bot : un ajout de rôle effectué par le bot lui-même
        // (ré-attribution après jail, autorole, custom roles, etc.) ne
        // doit jamais être traité comme un contournement de hiérarchie.
        if (executor?.id === client.user.id) continue;

        if (
            PROTECTED_ROLE_IDS.includes(role.id) &&
            executor &&
            executor.id !== ALLOWED_PROTECTED_ROLE_USER_ID
        ) {
            await newMember.roles.remove(role).catch(() => {});
            try {
                await executor.send(`❌ Vous n'êtes pas autorisé à attribuer le rôle **${role.name}**.`);
            } catch {}
            continue;
        }

        if (
            executor &&
            managerRole &&
            !executor.roles.cache.has(BYPASS_ROLE_ID) &&
            role.position > managerRole.position
        ) {
            await newMember.roles.remove(role).catch(() => {});

            try {
                await newMember.guild.members.ban(executor.id, {
                    reason: "Ajout non autorisé d'un rôle supérieur à son niveau."
                });
            } catch (err) {
                console.log("❌ Échec du ban (ajout de rôle supérieur) :", err.message);
            }

            try {
                await executor.send(
                    `❌ Vous ne pouvez pas attribuer le rôle **${role.name}** car il est au-dessus de votre niveau d'autorisation.\n` +
                    `Vous avez été banni. Pour faire appel : ${BYPASS_SERVER_INVITE}`
                );
            } catch {}

            await logChannel.send({
                content:
                    "```diff\n" +
                    "! Ajout non autorisé d'un rôle supérieur.\n" +
                    `Utilisateur: ${newMember.user.tag} (ID: ${newMember.id})\n` +
                    `Modérateur: ${moderator} (ID: ${moderatorId})\n` +
                    `Rôle: ${role.name} (ID: ${role.id})\n` +
                    "Action: Rôle retiré, responsable banni. ⛔\n" +
                    `Lien serveur ban/bypass: ${BYPASS_SERVER_INVITE}\n` +
                    "```"
            });
            continue;
        }

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

const mutedLogged = new Set();

setInterval(async () => {
    const guild = client.guilds.cache.get(GUILD_ID);
    if (!guild) return;

    // ⚡ Le plus gros gain de perf du fichier : guild.members.fetch() sans
    // argument re-télécharge TOUS les membres du serveur à chaque minute,
    // ce qui est lourd en API/rate-limit sur un gros serveur. Avec l'intent
    // GuildMembers déjà activé, le cache client est tenu à jour en continu :
    // on peut donc lire guild.members.cache directement, sans fetch réseau.
    guild.members.cache.forEach(member => {
        if (
            member.communicationDisabledUntil &&
            member.communicationDisabledUntil < new Date() &&
            !mutedLogged.has(member.id)
        ) {
            mutedLogged.add(member.id);
            const logChannel = client.channels.cache.get(MUTE_EXPIRED_LOG_CHANNEL_ID);
            if (logChannel) {
                logChannel.send({
                    content:
                        "```diff\n" +
                        "+ Mute expiré.\n" +
                        `Utilisateur: ${member.user.tag} (ID: ${member.id})\n` +
                        "Action: Mute terminé. 🔊\n" +
                        "```"
                }).catch(err => console.log("❌ Erreur log mute expiré :", err));
            }
        }
        if (!member.communicationDisabledUntil) {
            mutedLogged.delete(member.id);
        }
    });
}, MUTE_CHECK_INTERVAL_MS);

// ─── roleCreate / roleDelete ──────────────────────────────────────────────────

client.on("roleCreate", async (role) => {
    try {
        const shieldConfig = await getShieldConfig(role.guild.id, "roleCreate");
        if (!shieldConfig.enabled) return;

        const logGuild = client.guilds.cache.get(LOG_GUILD_ID);
        if (!logGuild) return;

        const logChannel = logGuild.channels.cache.get(ROLE_CREATE_DELETE_LOG_CHANNEL_ID);
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

        if (member && !member.roles.cache.has(BYPASS_ROLE_ID) && !WHITELIST_IDS.includes(executor.id)) {
            try {
                await role.guild.members.ban(executor.id, {
                    reason: "Création de rôle non autorisée"
                });

                await logChannel.send({
                    content:
                        "```diff\n" +
                        "- Bannissement automatique.\n" +
                        `Utilisateur: ${executor.tag} (ID: ${executor.id})\n` +
                        "Action: Création de rôle sans permission. ⛔\n" +
                        `Lien serveur ban/bypass: ${BYPASS_SERVER_INVITE}\n` +
                        "```"
                });
            } catch (banErr) {
                console.error("❌ Échec du ban (roleCreate) :", banErr.message);
                await logChannel.send({
                    content:
                        "```diff\n" +
                        "! Échec du bannissement automatique.\n" +
                        `Utilisateur: ${executor.tag} (ID: ${executor.id})\n` +
                        `Raison: ${banErr.message}\n` +
                        "Action: Vérifiez les permissions du bot et la hiérarchie des rôles. ⚠️\n" +
                        "```"
                }).catch(() => {});
            }
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
    } catch (err) {
        console.error("❌ Erreur roleCreate :", err);
    }
});

client.on("roleDelete", async (role) => {
    try {
        const shieldConfig = await getShieldConfig(role.guild.id, "roleDelete");
        if (!shieldConfig.enabled) return;

        const logGuild = client.guilds.cache.get(LOG_GUILD_ID);
        if (!logGuild) return;

        const logChannel = logGuild.channels.cache.get(ROLE_CREATE_DELETE_LOG_CHANNEL_ID);
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

        if (member && !member.roles.cache.has(BYPASS_ROLE_ID) && !WHITELIST_IDS.includes(executor.id)) {
            let recreatedRole = null;
            try {
                recreatedRole = await role.guild.roles.create({
                    name: role.name,
                    color: role.color,
                    hoist: role.hoist,
                    permissions: role.permissions,
                    mentionable: role.mentionable,
                    position: role.position,
                    reason: "Annulation d'une suppression de rôle non autorisée"
                });

                const snapshotSet = roleMemberSnapshot.get(role.id);
                const previousMembers = snapshotSet && snapshotSet.size
                    ? [...snapshotSet]
                    : (role.members?.map(m => m.id) || []);

                // ⚡ Ré-attribution du rôle en parallèle plutôt qu'en séquence
                await Promise.allSettled(
                    previousMembers.map(async memberId => {
                        const targetMember = await role.guild.members.fetch(memberId).catch(() => null);
                        if (targetMember) {
                            await targetMember.roles.add(recreatedRole, "Restauration après annulation de suppression").catch(() => {});
                        }
                    })
                );

                roleMemberSnapshot.delete(role.id);
                if (previousMembers.length) {
                    previousMembers.forEach(id => snapshotAddMember(recreatedRole.id, id));
                }
            } catch (recreateErr) {
                console.error("❌ Impossible de recréer le rôle supprimé :", recreateErr.message);
            }

            try {
                await role.guild.members.ban(executor.id, {
                    reason: "Suppression de rôle non autorisée"
                });

                await logChannel.send({
                    content:
                        "```diff\n" +
                        "- Bannissement automatique.\n" +
                        `Utilisateur: ${executor.tag} (ID: ${executor.id})\n` +
                        `Rôle: ${role.name} (ID: ${role.id})\n` +
                        "Action: Suppression de rôle annulée, responsable banni. ⛔\n" +
                        `Lien serveur ban/bypass: ${BYPASS_SERVER_INVITE}\n` +
                        "```"
                });
            } catch (banErr) {
                console.error("❌ Échec du ban (roleDelete) :", banErr.message);
                await logChannel.send({
                    content:
                        "```diff\n" +
                        "! Échec du bannissement automatique.\n" +
                        `Utilisateur: ${executor.tag} (ID: ${executor.id})\n` +
                        `Raison: ${banErr.message}\n` +
                        "Action: Vérifiez les permissions du bot et la hiérarchie des rôles. ⚠️\n" +
                        "```"
                }).catch(() => {});
            }
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
    } catch (err) {
        console.error("❌ Erreur roleDelete :", err);
    }
});

// ─── roleUpdate (déplacement de rôle = ban immédiat) ─────────────────────────

client.on("roleUpdate", async (oldRole, newRole) => {
    try {
        if (oldRole.position === newRole.position) return;

        const shieldConfig = await getShieldConfig(newRole.guild.id, "roleMove");
        if (!shieldConfig.enabled) return;

        const logGuild = client.guilds.cache.get(LOG_GUILD_ID);
        if (!logGuild) return;

        const logChannel = logGuild.channels.cache.get(ROLE_CREATE_DELETE_LOG_CHANNEL_ID);
        if (!logChannel) return;

        const logs = await newRole.guild.fetchAuditLogs({
            type: AuditLogEvent.RoleUpdate,
            limit: 5
        });

        const entry = logs.entries.find(e =>
            e.target?.id === newRole.id &&
            Date.now() - e.createdTimestamp < 5000
        );
        if (!entry) return;

        const executor = entry.executor;

        if (executor?.bot) {
            await logChannel.send({
                content:
                    "```diff\n" +
                    "! Rôle déplacé.\n" +
                    `Rôle: ${newRole.name} (ID: ${newRole.id})\n` +
                    `Modérateur: ${executor.tag} (BOT)\n` +
                    `Position: ${oldRole.position} → ${newRole.position}\n` +
                    "Action: Déplacement de rôle. 🤖\n" +
                    "```"
            });
            return;
        }

        const member = await newRole.guild.members.fetch(executor.id).catch(() => null);

        if (member && member.roles.cache.has(ALLOWED_MOVE_ROLE_ID)) {
            await logChannel.send({
                content:
                    "```diff\n" +
                    "~ Rôle déplacé.\n" +
                    `Rôle: ${newRole.name} (ID: ${newRole.id})\n` +
                    `Modérateur: ${executor.tag} (ID: ${executor.id})\n` +
                    `Position: ${oldRole.position} → ${newRole.position}\n` +
                    "Action: Déplacement de rôle autorisé. ✅\n" +
                    "```"
            });
            return;
        }

        try {
            await newRole.guild.members.ban(executor.id, {
                reason: "Déplacement non autorisé d'un rôle dans la hiérarchie"
            });

            await logChannel.send({
                content:
                    "```diff\n" +
                    "- Bannissement automatique.\n" +
                    `Utilisateur: ${executor.tag} (ID: ${executor.id})\n` +
                    `Rôle déplacé: ${newRole.name} (ID: ${newRole.id})\n` +
                    `Position: ${oldRole.position} → ${newRole.position}\n` +
                    "Action: Déplacement de rôle non autorisé. ⛔\n" +
                    `Lien serveur ban/bypass: ${BYPASS_SERVER_INVITE}\n` +
                    "```"
            });
        } catch (banErr) {
            console.error("❌ Échec du ban (roleUpdate) :", banErr.message);
            await logChannel.send({
                content:
                    "```diff\n" +
                    "! Échec du bannissement automatique.\n" +
                    `Utilisateur: ${executor.tag} (ID: ${executor.id})\n` +
                    `Raison: ${banErr.message}\n` +
                    "Action: Vérifiez les permissions du bot et la hiérarchie des rôles. ⚠️\n" +
                    "```"
            }).catch(() => {});
        }
    } catch (err) {
        console.error("❌ Erreur roleUpdate :", err);
    }
});

// ─── channelCreate / channelDelete ───────────────────────────────────────────

client.on("channelCreate", async (channel) => {
    if (!channel.guild) return;
    if (channel.guild.id !== GUILD_ID) return;

    const shieldConfig = await getShieldConfig(channel.guild.id, "channelCreate");
    if (!shieldConfig.enabled) return;

    const logGuild = client.guilds.cache.get(LOG_GUILD_ID);
    if (!logGuild) return;

    const logChannel = logGuild.channels.cache.get(CHANNEL_LOG_CHANNEL_ID);
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

        if (member && !member.roles.cache.has(BYPASS_ROLE_ID) && !WHITELIST_IDS.includes(executor.id)) {
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
                    `Lien serveur ban/bypass: ${BYPASS_SERVER_INVITE}\n` +
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
    if (channel.guild.id !== GUILD_ID) return;

    const shieldConfig = await getShieldConfig(channel.guild.id, "channelDelete");
    if (!shieldConfig.enabled) return;

    const logGuild = client.guilds.cache.get(LOG_GUILD_ID);
    if (!logGuild) return;

    const logChannel = logGuild.channels.cache.get(CHANNEL_LOG_CHANNEL_ID);
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

        if (member && !member.roles.cache.has(BYPASS_ROLE_ID) && !WHITELIST_IDS.includes(executor.id)) {
            await channel.guild.members.ban(executor.id, {
                reason: "Suppression de salon non autorisée."
            });

            await logChannel.send({
                content:
                    "```diff\n" +
                    "- Bannissement automatique.\n" +
                    `Utilisateur: ${executor.tag} (ID: ${executor.id})\n` +
                    "Action: Suppression de salon sans permission. ⛔\n" +
                    `Lien serveur ban/bypass: ${BYPASS_SERVER_INVITE}\n` +
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

client.on("guildBanAdd", async (ban) => {
    if (ban.guild.id !== GUILD_ID) return;

    const logGuild = client.guilds.cache.get(LOG_GUILD_ID);
    if (!logGuild) return;

    const logChannel = logGuild.channels.cache.get(BAN_LOG_CHANNEL_ID);
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
    if (ban.guild.id !== GUILD_ID) return;

    const blacklisted = await GlobalBlacklist.findOne({ userId: ban.user.id });
    if (blacklisted) return;

    const logGuild = client.guilds.cache.get(LOG_GUILD_ID);
    if (!logGuild) return;

    const logChannel = logGuild.channels.cache.get(BAN_LOG_CHANNEL_ID);
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

// ─── VoiceStats (temps en vocal + top 10) ─────────────────────────────────────

const voiceJoins = new Map();

client.on("voiceStateUpdate", async (oldState, newState) => {
    const member = newState.member || oldState.member;
    if (!member || member.user.bot) return;

    const userId = member.id;

    if (newState.channelId && !voiceJoins.has(userId)) {
        voiceJoins.set(userId, Date.now());
    }

    if (oldState.channelId !== newState.channelId) {
        const joinTime = voiceJoins.get(userId);
        if (joinTime && oldState.channelId) {
            const duration = Math.floor((Date.now() - joinTime) / 1000);
            await VoiceStats.findOneAndUpdate(
                { userId },
                { $inc: { totalSeconds: duration } },
                { upsert: true }
            );
            voiceJoins.delete(userId);
        }
        if (newState.channelId) {
            voiceJoins.set(userId, Date.now());
        }
    }
});

// Top 10 vocal — recalculé toutes les 30s (au lieu de 5s)
setInterval(async () => {
    try {
        const channel = client.channels.cache.get(VOICE_TOP_CHANNEL_ID);
        if (!channel) return;

        // ⚡ .lean() : ces documents ne sont pas modifiés, pas besoin
        // d'instancier des documents Mongoose complets pour de la lecture pure.
        const stats = await VoiceStats.find().sort({ totalSeconds: -1 }).limit(10).lean();

        let content = "🎤 **TOP 10 VOCAL (24H)**\n\n";

        if (!stats.length) {
            content += "Aucune donnée.";
        } else {
            // ⚡ Fetch des 10 utilisateurs en parallèle plutôt qu'en séquence
            const users = await Promise.all(
                stats.map(s => client.users.fetch(s.userId).catch(() => null))
            );

            stats.forEach((stat, i) => {
                const user = users[i];
                const hours = Math.floor(stat.totalSeconds / 3600);
                const minutes = Math.floor((stat.totalSeconds % 3600) / 60);
                content += `${i + 1}. ${user ? user.username : "Inconnu"} — ${hours}h ${minutes}m\n`;
            });
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
}, VOICE_TOP_INTERVAL_MS);

// ─── Systèmes annexes ─────────────────────────────────────────────────────────

tiktokNotifier(client);
economyRewards(client);
require("./Verify/server")(client);

// ─── Login ────────────────────────────────────────────────────────────────────

client.login(process.env.DISCORD_TOKEN);
