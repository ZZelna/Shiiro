require("dotenv").config();

const fs = require("fs");
const { Client, GatewayIntentBits,
       ActivityType
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

client.login(process.env.DISCORD_TOKEN);
