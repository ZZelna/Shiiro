const config = require("../../config.json");

module.exports = {
    name: "mp",

    async run(message, args) {

        if (!config.owner_ids.includes(message.author.id)) {
            return message.reply("❌ Cette commande est réservée aux owners.");
        }

        const userId = args[0];

        if (!userId) {
            return message.reply("❌ Utilisation : +mp <id> <message>");
        }

        const target = await message.client.users
            .fetch(userId)
            .catch(() => null);

        if (!target) {
            return message.reply("❌ ID utilisateur invalide.");
        }

        const msg = args.slice(1).join(" ");

        if (!msg) {
            return message.reply("❌ Tu dois fournir un message.");
        }

        try {

            await target.send(msg);

            return message.reply(
                ✅ Message envoyé à ${target.tag}.
            );

        } catch (err) {

            console.log(err);

            return message.reply(
                "❌ Impossible d'envoyer un message privé à cet utilisateur."
            );

        }
    }
};
