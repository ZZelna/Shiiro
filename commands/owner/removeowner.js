const fs = require("fs");
const config = require("../../config.json");

module.exports = {
    name: "removeowner",

    async run(message) {

        if (!config.owner_ids.includes(message.author.id)) {
            return message.reply("❌ Cette commande est réservée aux owners.");
        }

        const user = message.mentions.users.first();

        if (!user) {
            return message.reply("❌ Utilisation : `+removeowner @user`");
        }

        if (!config.owner_ids.includes(user.id)) {
            return message.reply("❌ Cet utilisateur n'est pas owner.");
        }

        config.owner_ids = config.owner_ids.filter(
            id => id !== user.id
        );

        fs.writeFileSync(
            "./config.json",
            JSON.stringify(config, null, 2)
        );

        return message.reply(
            `✅ ${user.tag} a été retiré des owners.`
        );
    }
};
