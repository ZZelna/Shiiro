const whitelist = require("../../data/whitelist/users.json");

module.exports = {
    name: "ban",

    async run(message, args) {

        if (!whitelist.users.includes(message.author.id)) {
            return message.reply("❌ Tu n'es pas whitelist.");
        }

        const target =
            message.mentions.users.first() ||
            await message.client.users.fetch(args[0]).catch(() => null);

        if (!target) {
            return message.reply(
                "❌ Utilisation : `+ban @user raison`"
            );
        }

        if (target.id === message.author.id) {
            return message.reply(
                "❌ Tu ne peux pas te bannir toi-même."
            );
        }

        const reason =
            args.slice(1).join(" ") ||
            "Aucune raison fournie.";

        try {

            await target.send({
                embeds: [{
                    color: 0xED4245,
                    title: "🔨 Bannissement",
                    description:
`Bonjour,

Vous avez été banni du serveur **${message.guild.name}**.

📋 **Raison :**
${reason}

🔓 **Serveur d'unban :**
https://discord.gg/FZqjCqMmXY

Merci de créer un ticket sur le serveur d'unban afin qu'un juge puisse examiner votre demande.`,
                    thumbnail: {
                        url: message.guild.iconURL()
                    },
                    timestamp: new Date()
                }]
            });

        } catch {}

        await message.guild.members.ban(target.id, {
            reason: `${reason} | Ban par ${message.author.tag}`
        });

        message.reply({
            embeds: [{
                color: 0x57F287,
                title: "✅ Utilisateur banni",
                description:
`👤 **Utilisateur :** ${target.tag}
📋 **Raison :** ${reason}
🛡️ **Juge :** ${message.author.tag}`,
                timestamp: new Date()
            }]
        });
    }
};
