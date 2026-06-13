require("dotenv").config();

const fs = require("fs");
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

client.commands = new Map();

const commandFolders = fs.readdirSync("./commands");

for (const folder of commandFolders) {
    const commandFiles = fs
      .readdirSync(`./commands/${folder}`)
        .filter(file => file.endsWith(".js"));

    for (const file of commandFiles) {
        const command = require(`./commands/${folder}/${file}`)
        client.commands.set(command.name, command);
    }
}
console.log([...client.commands.keys()]);

client.on("messageCreate", async (message) => {

    if (message.author.bot) return;

    const args = message.content.slice(1).trim().split(/ +/);
const commandName = args.shift()?.toLowerCase();

const command = client.commands.get(commandName);

if (command) {
    return command.run(message, args);
}

    if (message.content === "+help") {
    message.reply(`
📚 **Commandes disponibles**

📖 +help → Affiche cette liste

🖼️ +pic @user → Affiche l'avatar d'un utilisateur
🎨 +banner @user → Affiche la bannière d'un utilisateur

🚧 D'autres commandes arrivent bientôt...
`);
}

});

client.once("ready", () => {
console.log(`✅ ${client.user.tag} est connecté !`);
});

client.login(process.env.DISCORD_TOKEN);
