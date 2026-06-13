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

    if (message.content.startsWith("+banner")) {
        const target = message.mentions.users.first() || message.author;

        const user = await client.users.fetch(target.id, {
            force: true
        });

        if (!user.banner) {
            return message.reply("❌ Cet utilisateur n'a pas de bannière.");
        }

        const comments = [
    `🎨 Une bannière qui attire le regard.`,
    `✨ ${user.username} sait soigner son profil.`,
    `🌌 Cette bannière a beaucoup de caractère.`,
    `🔥 Une bannière vraiment stylée.`,
    `👀 Ça mérite qu'on s'y attarde quelques secondes.`,
    `🎭 La bannière parfaite pour compléter le profil.`
];

        const comment = comments[Math.floor(Math.random() * comments.length)];

        const embed = {
            color: 0x5865F2,
title: `🎨 Bannière de ${user.username}`,
            description: comment,
            image: {
                url: user.bannerURL({
                    size: 1024,
                    forceStatic: false
                })
            },
            footer: {
text: `Demandé par ${message.author.username}`
            },
            timestamp: new Date()
        };

        message.reply({ embeds: [embed] });
    }
});

client.once("ready", () => {
console.log(`✅ ${client.user.tag} est connecté !`);
});

client.login(process.env.DISCORD_TOKEN);
