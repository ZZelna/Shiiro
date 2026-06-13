const whitelist = require("../../data/whitelist/users.json");
const config = require("../../config.json");

module.exports = {
    name: "dm",

    async run(message, args) {

        if (
            !whitelist.users.includes(message.author.id) &&
            !config.owner_ids.includes(message.author.id)
        ) {
            return message.reply("❌ Tu n'as pas la permission d'utiliser cette commande.");
        }

        const userId = args[0];

        if (!userId) {
            return message.reply("❌ Utilisation : +dm <id>");
        }

        const target = await message.client.users
            .fetch(userId)
            .catch(() => null);

        if (!target) {
            return message.reply("❌ ID utilisateur invalide.");
        }

        try {

            await target.send(
👋 Coucou,  Tu peux désormais revenir sur **Shiiro** !  🔗 https://discord.gg/5XkaE44EgN
            );

            return message.reply(
                ✅ Message envoyé à ${target.tag}.
            );

        } catch (err) {

            return message.reply(
                "❌ Impossible d'envoyer un message privé à cet utilisateur."
            );

        }
    }
};
