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

        const allowedUsers = [
            "1441136552842367027",
            "1292848857704566866",
            "1507851969572765756",
            "1421806026537173032",
            "1500273343054614529",
            "1010620278541402226",
            "1386994361216274472",
            "1418370654251778168",
            "1277800588578521146",
            "1495834533797298176",
            "1433895666823860295",
            "1437428643377713262",
            "1270797559786635388",
            "1359956098614038699",
            "1035241635937783848",
            "1135944293148786768",
            "1359115571471585452",
            "1196016822869303368",
            "1453888913490972836",
            "779124269518946314",
            "1340746846871748719",
            "1411762668003528904",
            "1436025468133314687",
            "1307161147203522570",
            "1395650564057989242",
            "1291775420735422523",
            "1440416200646594612",
            "1400111418358894646"
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
                "❌ Utilisation : +jail @membre spam | insultes | nfsw | <minutes>"
            );
        }

        if (member.id === message.author.id) {
            return message.reply(
                "❌ Vous ne pouvez pas vous jail."
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
                    JAILABLE_ROLES.includes(role.id)
                )
                .map(role => role.id);

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
