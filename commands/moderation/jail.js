const fs = require("fs");
const path = require("path");
const jailData = require("../../data/jail.json");

module.exports = {
    name: "jail",

    async run(message, args) {

        const allowedRoles = [
            "1506678694352261301",
            "1506678765982318743",
            "1506698593199718644",
            "1509601528242110525",
            "1507082580414173234",
            "1506696551706267688",
            "1506696757642530982",
            "1506709088451690708",
            "1506702398029172796"
        ];

        if (
            !message.member.roles.cache.some(role =>
                allowedRoles.includes(role.id)
            )
        ) {
            return message.reply(
                "❌ Vous n'avez pas la permission d'utiliser cette commande."
            );
        }

        const member =
            message.mentions.members.first() ||
            message.guild.members.cache.get(args[0]);

        if (!member) {
            return message.reply(
                "❌ Utilisation : +jail @membre"
            );
        }

        if (member.id === message.author.id) {
            return message.reply(
                "❌ Vous ne pouvez pas vous jail."
            );
        }

        const prisonRole = message.guild.roles.cache.get(
            "1508842233619677306"
        );

        if (!prisonRole) {
            return message.reply(
                "❌ Rôle prison introuvable."
            );
        }

        if (!jailData.users) {
            jailData.users = {};
        }

        if (jailData.users[member.id]) {
            return message.reply(
                "❌ Ce membre est déjà en prison."
            );
        }

        const oldRoles = member.roles.cache
            .filter(role => role.id !== message.guild.id)
            .map(role => role.id);

        jailData.users[member.id] = oldRoles;

      fs.writeFileSync(
    path.join(__dirname, "../../data/jail.json"),
    JSON.stringify(jailData, null, 4)
);

        await member.roles.set([
            prisonRole.id
        ]);

        return message.channel.send(
            `🔒 ${member} a été **JAIL** par ${message.author}, veuillez le contacter pour être libéré.`
        );
    }
};
