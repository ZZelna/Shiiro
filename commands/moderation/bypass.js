const fs = require("fs");
const path = require("path");
const bypassData = require("../../data/bypass.json");

module.exports = {
    name: "bypass",

    async run(message, args) {

        const allowedUsers = [
            "1507851969572765756",
            "1010620278541402226",
            "1421806026537173032",
            "1495834533797298176",
            "1500273343054614529",
            "1386994361216274472",
            "1277800588578521146",
            "1418370654251778168",
            "1441136552842367027",
            "1292848857704566866"
        ];

        if (!allowedUsers.includes(message.author.id)) {
            return message.reply(
                "❌ Vous n'avez pas la permission."
            );
        }

        const user =
            message.mentions.users.first() ||
            await message.client.users.fetch(args[0]).catch(() => null);

        if (!user) {
            return message.reply(
                "❌ Utilisation : +bypass @user"
            );
        }

        if (!bypassData.users.includes(user.id)) {

            bypassData.users.push(user.id);

            fs.writeFileSync(
                path.join(__dirname, "../../data/bypass.json"),
                JSON.stringify(bypassData, null, 4)
            );
        }

        return message.channel.send(
            `✅ ${user} a été ajouté à la liste bypass.`
        );
    }
};
