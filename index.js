require("dotenv").config();

const fs = require("fs");
const mongoose = require("mongoose");
const Stats = require("./systems/stats");
const {
    Client,
    GatewayIntentBits,
    ActivityType,
    EmbedBuilder,
    REST,
    Routes
} = require("discord.js");

const config = require("./config.json");

function getCustomRole(commandName) {

    if (!config.custom_roles)
        return null;

    return config.custom_roles[
        commandName.toLowerCase()
    ] || null;
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

client.commands = new Map();

client.slashCommands = new Map();

const slashCommands =
    fs.readdirSync("./slashCommands")
        .filter(file => file.endsWith(".js"));

for (const file of slashCommands) {

    const command =
        require(`./slashCommands/${file}`);

    client.slashCommands.set(
        command.data.name,
        command
    );

    console.log(
        `✅ Slash chargée : ${command.data.name}`
    );
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

    const commands = [];

    client.slashCommands.forEach(command => {
    commands.push(
        command.data.toJSON()
    );
});

        const command =
            require(`./slashCommands/${file}`);

        commands.push(
            command.data.toJSON()
        );
    }

    const rest = new REST({
        version: "10"
    }).setToken(
        process.env.DISCORD_TOKEN
    );

    try {

        await rest.put(
            Routes.applicationCommands(
                client.user.id
            ),
            {
                body: commands
            }
        );

        console.log(
            "✅ Slash commands enregistrées"
        );

    } catch (err) {

        console.error(
            "❌ Erreur slash commands :",
            err
        );

    }

});
client.on("messageDelete", async (message) => {

    if (!message.guild) return;
    if (message.author?.bot) return;

    const snipes =
        client.snipes.get(message.channel.id) || [];

    snipes.unshift({
        content: message.content || "Aucun texte",
        author: message.author?.tag || "Inconnu",
        authorId: message.author?.id,
        image:
            message.attachments.first()?.url || null,
        createdAt: Date.now()
    });

    if (snipes.length > 10)
        snipes.pop();

    client.snipes.set(
        message.channel.id,
        snipes
    );
});

client.on("messageCreate", async (message) => {

    if (message.author.bot) return;
    if (!message.content.startsWith("+")) return;

    const args = message.content.slice(1).trim().split(/ +/);
    const commandName = args.shift()?.toLowerCase();

       const customRole =
    getCustomRole(commandName);

if (customRole) {

    const target =
        message.mentions.members.first();

    if (!target) {
        return message.reply(
            `❌ Utilisation : +${commandName} @utilisateur`
        );
    }

    if (
        message.author.id !==
        customRole.owner_id
    ) {
        return message.reply(
            "❌ Vous n'êtes pas propriétaire de ce rôle."
        );
    }

    const role =
        message.guild.roles.cache.get(
            customRole.role_id
        );

    if (!role) {
        return message.reply(
            "❌ Rôle introuvable."
        );
    }

    try {

        if (
            target.roles.cache.has(role.id)
        ) {

            await target.roles.remove(role);

            return message.reply(
                `➖ ${role.name} retiré à ${target.user.tag}`
            );

        }

        await target.roles.add(role);

        return message.reply(
            `➕ ${role.name} ajouté à ${target.user.tag}`
        );

    } catch {

        return message.reply(
            "❌ Impossible de modifier ce rôle."
        );
    }
}
    const command = client.commands.get(commandName);

    if (command) {
        return command.run(message, args);
    }
});

const interactionCreate = require("./events/interaction/interactionCreate");
client.on("interactionCreate", async (interaction) => {

    // Slash commands
    if (interaction.isChatInputCommand()) {

        const command =
            client.slashCommands.get(
                interaction.commandName
            );

        if (!command) return;

        try {

            await command.execute(
                interaction
            );

        } catch (error) {

            console.error(error);

            await interaction.reply({
                content:
                    "❌ Une erreur est survenue.",
                ephemeral: true
            }).catch(() => {});
        }

        return;
    }

    // Boutons / Modals / Menus
    interactionCreate(interaction);

});
const antiAlt = require("./events/antiAlt");
const voiceMoveLogs =
require("./events/voice/voiceMoveLogs");

client.on(
    "voiceStateUpdate",
    voiceMoveLogs
);
const welcome = require("./events/welcome");
const memberJoin =
require("./events/logs/memberJoin");

const memberLeave =
require("./events/logs/memberLeave");

client.on(
    "guildMemberAdd",
    memberJoin
);

client.on(
    "guildMemberRemove",
    memberLeave
);
client.on("guildMemberAdd", (member) => {

    if (member.user.bot) return;

    antiAlt(member);
    welcome(member);

});
        
const sticky = require("./events/sticky");

client.on("messageCreate", sticky);
client.on("messageCreate", async (message) => {

    if (message.author.bot) return;

    let userStats = await Stats.findOne({
        userId: message.author.id
    });

    if (!userStats) {

        userStats = await Stats.create({
            userId: message.author.id
        });

    }

    userStats.messages++;
       const today =
    new Date()
        .toISOString()
        .slice(0, 10);

userStats.dailyMessages.set(
    today,
    (
        userStats.dailyMessages.get(today)
        || 0
    ) + 1
);
       userStats.xp += 5;

const nextLevel =
    userStats.level * 100;

if (
    userStats.xp >= nextLevel
) {

       userStats.level++;

}

    await userStats.save();

});

client.on("presenceUpdate", async (oldPresence, newPresence) => {

if (!newPresence?.member) return;
const roleId = "1514348874427404529";
const logChannelId = "1514369589310652517";
const customStatus =
    newPresence.activities.find(
        activity => activity.type === 4
    );

       const hasShiiiro =
    customStatus?.state
        ?.toLowerCase()
        ?.includes("/shiiro") || false;

       const member = newPresence.member;
const logs =
    member.guild.channels.cache.get(
        logChannelId
    );
if (hasShiiiro) {
    if (!member.roles.cache.has(roleId)) {
        await member.roles.add(roleId)
            .catch(() => {});
        if (logs) {
            const embed = new EmbedBuilder()
                .setColor("Green")
                .setTitle("✅ Rôle Statut Ajouté")
                .setDescription(
                    `${member} a obtenu le rôle <@&${roleId}> grâce à son statut.`
                )
                .addFields({
    name: "📌 Statut détecté",
    value: "/Shiiro"
})
                .setThumbnail(
                    member.user.displayAvatarURL()
                )
                .setTimestamp();
            logs.send({
                embeds: [embed]
            });
        }
    }
} else {
    if (member.roles.cache.has(roleId)) {
        await member.roles.remove(roleId)
            .catch(() => {});
        if (logs) {
            const embed = new EmbedBuilder()
                .setColor("Red")
                .setTitle("❌ Rôle Statut Retiré")
                .setDescription(
                    `${member} a perdu le rôle <@&${roleId}>.`
                )
                .addFields({
    name: "📌 Raison",
    value: "Le statut /Shiiro a été retiré."
})
   .setThumbnail(
  member.user.displayAvatarURL()
                )
 .setTimestamp();
            
               logs.send({
                embeds: [embed]
            });
        }
    }
}

});
mongoose.connect(process.env.MONGODB_URI)
.then(() => {
    console.log("✅ MongoDB connecté !");
})
.catch(err => {
    console.error("❌ Erreur MongoDB :", err);
});
client.login(process.env.DISCORD_TOKEN);
