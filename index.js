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

client.on("messageCreate", async (message) => {
    if (message.author.bot) return;

    if (message.content === "+ping") {
        message.reply("🏓 Pong !");
    }
    if (message.content === "+help") {
    message.reply(`
📚 **Commandes disponibles**

🏓 +ping → Vérifie que le bot répond
📖 +help → Affiche cette liste

🚧 D'autres commandes arrivent bientôt...
`);
}
  if (message.content.startsWith("+pic")) {
    const user = message.mentions.users.first() || message.author;

    const embed = {
        color: 0x5865F2,
        title: `🖼️ Avatar de ${user.username}`,
        description: `Voici l'avatar de ${user}.`,
        image: {
            url: user.displayAvatarURL({
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
    if (message.content.startsWith("+banner")) {
    const target = message.mentions.users.first() || message.author;

    const user = await client.users.fetch(target.id, {
        force: true
    });

    if (!user.banner) {
        return message.reply("❌ Cet utilisateur n'a pas de bannière.");
    }

    const embed = {
        color: 0x5865F2,
        title: `🎨 Bannière de ${user.username}`,
        description: `Voici la bannière de ${user}.`,
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
