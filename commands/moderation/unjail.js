const fs = require("fs");
const path = require("path");
const jailData = require("../../data/jail.json");

module.exports = {
    name: "unjail",

    async run(message, args) {

        const allowedUsers = [
    "1507851969572765756",
    "1421806026537173032",
    "1500273343054614529",
    "1010620278541402226",
    "1386994361216274472",
    "1418370654251778168",
    "1277800588578521146",
    "1495834533797298176",
    "1441136552842367027",
    "1292848857704566866"
];
        if (!allowedUsers.includes(message.author.id)) {
            return message.reply(
                "❌ Vous n'avez pas la permission d'utiliser cette commande."
            );
        }

        const member =
            message.mentions.members.first() ||
            message.guild.members.cache.get(args[0]);

        if (!member) {
            return message.reply(
                "❌ Utilisation : +unjail @membre"
            );
        }

        if (!jailData.users || !jailData.users[member.id]) {
            return message.reply(
                "❌ Ce membre n'est pas en prison."
            );
        }

        const oldRoles = jailData.users[member.id];

        await member.roles.set(oldRoles);

        delete jailData.users[member.id];

      fs.writeFileSync(
    path.join(__dirname, "../../data/jail.json"),
    JSON.stringify(jailData, null, 4)
);

        return message.channel.send(
            `🔓 ${member} a été libéré par ${message.author}.`
        );
    }
};
