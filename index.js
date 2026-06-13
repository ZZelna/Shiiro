require("dotenv").config();

const { Client, GatewayIntentBits } = require("discord.js");

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildVoiceStates
    ]
});

client.on("messageCreate", (message) => {
    if (message.author.bot) return;

    if (message.content === "+ping") {
        message.reply("🏓 Pong !");
    }
});

client.once("ready", () => {
    console.log(`✅ ${client.user.tag} est connecté !`);
});

client.login(process.env.DISCORD_TOKEN);
