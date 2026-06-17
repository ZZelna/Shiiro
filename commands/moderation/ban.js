const whitelist = require("../../data/whitelist/users.json");
const config = require("../../config.json");
const { EmbedBuilder } = require("discord.js");

module.exports = {
    name: "ban",

    async run(message, args) {

        const allowedRoles = [
    "1507082580414173234",
    "1433895666823860295",
    "1507851969572765756"
];

if (
    !config.owner_ids.includes(message.author.id) &&
    !whitelist.users.includes(message.author.id) &&
    !message.member.roles.cache.some(role =>
        allowedRoles.includes(role.id)
    )
) {
    return message.reply(
        "❌ Tu n'as pas la permission d'utiliser cette commande."
    );
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

const embed = new EmbedBuilder()
.setColor("#ED4245")
.setTitle("🔨 Bannissement effectué")
.setThumbnail(target.displayAvatarURL({ dynamic: true }))
.addFields(
    {
        name: "👤 Utilisateur",
        value: target.tag,
        inline: true
    },
    {
        name: "📋 Raison",
        value: reason,
        inline: true
    },
    {
        name: "🛡️ Juge",
        value: message.author.tag,
        inline: true
    }
)
.setTimestamp();

return message.reply({
    embeds: [embed]
});

}
};
