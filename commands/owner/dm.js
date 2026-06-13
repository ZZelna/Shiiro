const config = require("../../config.json");

module.exports = {
    name: "dm",

    async run(message, args) {

        if (!config.owner_ids.includes(message.author.id)) {
    return message.reply("❌ Cette commande est réservée aux owners.");
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
`👋 Coucou,

Tu peux désormais revenir sur **Shiiro** !

🔗 https://discord.gg/5XkaE44EgN`
);

            return message.reply(
                ✅ Message envoyé à ${target.tag}.
            );

        } catch (err) {

            return message.reply(
    `✅ Message envoyé à ${target.tag}.`
);

        }
    }
};
