const fs = require("fs");
const path = require("path");

const jailData = require("../../data/jail.json");

const JAILABLE_ROLES = [
    "1506674274826584284",
    "1506678694352261301",
    "1506678765982318743",
    "1506696551706267688",
    "1507082580414173234",
    "1506696757642530982",
    "1509601528242110525",
    "1506709088451690708"
];

const JAIL_ROLE = "1508842233619677306";

const REASONS = {
    spam: {
        duration: 5 * 60 * 1000,
        label: "Spam"
    },

    insultes: {
        duration: 5 * 60 * 1000,
        label: "Insultes"
    },

    nfsw: {
        duration: 60 * 60 * 1000,
        label: "NSFW (att ban)"
    }
};

module.exports = {
    name: "jail",

    async run(message, args) {

        const CAN_JAIL_ROLES = [
    "1506674274826584284",
    "1506678694352261301",
    "1506678765982318743",
    "1506696551706267688",
    "1507082580414173234",
    "1506696757642530982",
    "1509601528242110525",
    "1506709088451690708"
];

const hasPermission =
    message.member.roles.cache.some(
        role =>
            CAN_JAIL_ROLES.includes(
                role.id
            )
    );

if (!hasPermission) {

    return message.reply(
        "❌ Vous n'avez pas la permission d'utiliser cette commande."
    );

}
        const member =
            message.mentions.members.first() ||
            message.guild.members.cache.get(args[0]);

        if (!member) {
            return message.reply(
                "❌ Utilisation : +jail @membre spam | insultes | nfsw | <minutes>"
            );
        }

        if (member.id === message.author.id) {
            return message.reply(
                "❌ Vous ne pouvez pas vous jail."
            );
        }
if (
    member.roles.highest.position >=
    message.member.roles.highest.position
) {

    return message.reply(
        "❌ Vous ne pouvez pas jail un membre ayant un rôle supérieur ou égal au vôtre."
    );

}
        if (
            member.roles.cache.has(
                "1506674274826584284"
            )
        ) {
            return message.reply(
                "❌ Impossible de jail un Owner."
            );
        }

        const prisonRole =
            message.guild.roles.cache.get(
                JAIL_ROLE
            );

        if (!prisonRole) {
            return message.reply(
                "❌ Rôle prison introuvable."
            );
        }

        const reasonArg =
            args[1]?.toLowerCase();

        let duration;
        let reason;

        if (REASONS[reasonArg]) {

            duration =
                REASONS[reasonArg].duration;

            reason =
                REASONS[reasonArg].label;

        } else {

            const custom =
                parseInt(args[1]);

            if (!custom || custom <= 0) {
                return message.reply(
                    "❌ Motif invalide."
                );
            }

            duration =
                custom * 60 * 1000;

            reason =
                `Personnalisé (${custom} min)`;
        }

        if (!jailData.users) {
            jailData.users = {};
        }

        if (jailData.users[member.id]) {
            return message.reply(
                "❌ Ce membre est déjà jail."
            );
        }

        const removedRoles =
    member.roles.cache

        .filter(role =>
            role.id !== message.guild.id &&
            role.id !== JAIL_ROLE
        )

        .map(role =>
            role.id
        );

        jailData.users[member.id] = {
            roles: removedRoles,
            endTime: Date.now() + duration
        };

        fs.writeFileSync(
            path.join(
                __dirname,
                "../../data/jail.json"
            ),
            JSON.stringify(
                jailData,
                null,
                4
            )
        );

        try {

            if (removedRoles.length) {
                await member.roles.remove(
                    removedRoles
                );
            }

            await member.roles.add(
                prisonRole
            );

        } catch (err) {

            console.log(err);

            return message.reply(
                `❌ ${err.message}`
            );
        }

        return message.channel.send(
            `🔒 ${member} a été jail pour **${reason}** pendant **${Math.floor(duration / 60000)} minute(s)**.`
        );
    }
};
