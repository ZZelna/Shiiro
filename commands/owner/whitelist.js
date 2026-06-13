const fs = require("fs");

const config = require("../../config.json");

module.exports = {
    name: "whitelist",

    async run(message, args) {

        if (!config.owner_ids.includes(message.author.id)) {
            return message.reply("❌ Tu n'es pas owner.");
        }

        const data = require("../../data/whitelist/users.json");

        const sub = args[0]?.toLowerCase();

        if (!sub) {

            const users = data.users.length
                ? data.users.map(id => `<@${id}>`).join("\n")
                : "Aucun utilisateur whitelist.";

            return message.reply({
                embeds: [{
                    color: 0x5865F2,
                    title: "🛡️ Liste des juges",
                    description: users,
                    footer: {
                        text: `Total : ${data.users.length}`
                    }
                }]
            });
        }

        if (sub === "add") {

            const user = message.mentions.users.first();

            if (!user) {
                return message.reply(
                    "❌ Mentionne un utilisateur."
                );
            }

            if (data.users.includes(user.id)) {
                return message.reply(
                    "❌ Cet utilisateur est déjà whitelist."
                );
            }

            data.users.push(user.id);

            fs.writeFileSync(
                "./data/whitelist/users.json",
                JSON.stringify(data, null, 2)
            );

            return message.reply(
                `✅ ${user.tag} a été ajouté à la whitelist.`
            );
        }

        if (sub === "del") {

            const user = message.mentions.users.first();

            if (!user) {
                return message.reply(
                    "❌ Mentionne un utilisateur."
                );
            }

            if (!data.users.includes(user.id)) {
                return message.reply(
                    "❌ Cet utilisateur n'est pas whitelist."
                );
            }

            data.users = data.users.filter(
                id => id !== user.id
            );

            fs.writeFileSync(
                "./data/whitelist/users.json",
                JSON.stringify(data, null, 2)
            );

            return message.reply(
                `✅ ${user.tag} a été retiré de la whitelist.`
            );
        }

        return message.reply(
            "❌ Utilisation : `+whitelist`, `+whitelist add @user`, `+whitelist del @user`"
        );
    }
};
