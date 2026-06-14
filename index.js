require("dotenv").config();

const fs = require("fs");
const { Client, GatewayIntentBits,
       ActivityType, 
       EmbedBuilder
} = require("discord.js");

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

client.once("clientReady", () => {

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

});

client.snipes = new Map();

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

    const command = client.commands.get(commandName);

    if (command) {
        return command.run(message, args);
    }
});

const interactionCreate = require("./events/interaction/interactionCreate");

client.on("interactionCreate", interactionCreate);

const antiAlt = require("./events/antiAlt");
const welcome = require("./events/welcome");

client.on("guildMemberAdd", antiAlt);
client.on("guildMemberAdd", welcome);

const sticky = require("./events/sticky");

client.on("messageCreate", sticky);

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
        ?.includes("/shiiiro") || false;

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
    .setColor("#57F287")
    .setTitle("✅ RÔLE AJOUTÉ")
    .setDescription(
        `\`\`\`
Membre : ${member.user.username}
ID     : ${member.id}
Rôle   : ${member.guild.roles.cache.get(roleId)?.name || roleId}
Statut : ${customStatus?.state || "Inconnu"}
\`\`\``
    )
    .setThumbnail(
        member.user.displayAvatarURL({
            dynamic: true
        })
    )
    .setTimestamp();

logs.send({
    embeds: [embed]
});

} else {

    if (member.roles.cache.has(roleId)) {

        await member.roles.remove(roleId)
            .catch(() => {});

        if (logs) {
const embed = new EmbedBuilder()
    .setColor("#ED4245")
    .setTitle("❌ RÔLE RETIRÉ")
    .setDescription(
        `\`\`\`
Membre : ${member.user.username}
ID     : ${member.id}
Rôle   : ${member.guild.roles.cache.get(roleId)?.name || roleId}
Statut : Supprimé
\`\`\``
    )
    .setThumbnail(
        member.user.displayAvatarURL({
            dynamic: true
        })
    )
    .setTimestamp();

 logs.send({
embeds: [embed]
            });
        }
    }
});

client.login(process.env.DISCORD_TOKEN);
