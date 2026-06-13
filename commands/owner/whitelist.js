const fs = require("fs");

module.exports = {
    name: "whitelist",

    async run(message, args) {

        const file = "./data/whitelist/users.json";

        const data = JSON.parse(
            fs.readFileSync(file, "utf8")
        );

        if (args[0] === "add") {

            const user = message.mentions.users.first();

            if (!user) {
                return message.reply("❌ Mentionne un utilisateur.");
            }

            if (!data.users.includes(user.id)) {
                data.users.push(user.id);

                fs.writeFileSync(
                    file,
                    JSON.stringify(data, null, 2)
                );
            }

            return message.reply(`✅ ${user.tag} ajouté à la whitelist.`);
        }

        if (args[0] === "del") {

            const user = message.mentions.users.first();

            if (!user) {
                return message.reply("❌ Mentionne un utilisateur.");
            }

            data.users = data.users.filter(
                id => id !== user.id
            );

            fs.writeFileSync(
                file,
                JSON.stringify(data, null, 2)
            );

            return message.reply(`✅ ${user.tag} retiré de la whitelist.`);
        }

        return message.reply(
            data.users.length
                ? data.users.map(id => `<@${id}>`).join("\n")
                : "Aucun utilisateur whitelist."
        );
    }
};
