const fs = require("fs");
const path = require("path");
const jailData = require("../../data/jail.json");

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
        "❌ Utilisation : +jail @membre"
    );
}

if (
    member.roles.cache.has(
        "1506674274826584284"
    )
) {
    return message.reply(
        "❌ Vous ne pouvez pas jail un Owner."
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

     try {

    await member.roles.set([
        prisonRole.id
    ]);

} catch (err) {

    console.log("ERREUR JAIL :", err);

    return message.reply(
        `❌ ${err.message}`
    );

}

        return message.channel.send(
            `🔒 ${member} a été **JAIL** par ${message.author}, veuillez le contacter pour être libéré.`
        );
    }
};
