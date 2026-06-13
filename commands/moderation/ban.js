const whitelist = require("../../data/whitelist/users.json");
const config = require("../../config.json");

module.exports = {
    name: "ban",

    async run(message, args) {

        if (
            !whitelist.users.includes(message.author.id) &&
            !config.owner_ids.includes(message.author.id)
        ) {
            return message.reply("❌ Tu n'as pas la permission d'utiliser cette commande.");
        }

        const target =
            message.mentions.users.first() ||
            await message.client.users.fetch(args[0]).catch(() => null);

        if (!target) {
            return message.reply("❌ Utilisation : +ban @user raison");
        }

        if (target.id === message.author.id) {
            return message.reply("❌ Tu ne peux pas te bannir toi-même.");
        }

        const reason =
            args.slice(1).join(" ") ||
            "Aucune raison fournie.";

        try {
           await target.send(
`🔨 Tu as été banni du serveur **${message.guild.name}**

📋 Raison :
${reason}

🔓 Serveur d'unban :
https://discord.gg/FZqjCqMmXY

Merci de créer un ticket sur le serveur d'unban afin qu'un juge puisse examiner ta demande.`
);
        } catch (err) {
            console.log("Impossible d'envoyer le MP.");
        }

       await message.guild.members.ban(target.id, {
    reason: `${reason} | Ban par ${message.author.tag}`
});

       message.reply(
`✅ ${target.tag} a été banni.

📋 Raison : ${reason}
🛡️ Juge : ${message.author.tag}`
);
}
};
