const config = require("../../config.json");

module.exports = {
    name: "ownerlist",

    async run(message) {

        if (!config.owner_ids.includes(message.author.id)) {
            return message.reply("❌ Cette commande est réservée aux owners.");
        }

        let owners = [];

        for (const id of config.owner_ids) {

            const user = await message.client.users
                .fetch(id)
                .catch(() => null);

            owners.push(
                user
                    ? `• ${user.tag} (${id})`
                    : `• Utilisateur inconnu (${id})`
            );
        }

        return message.reply(
`👑 Liste des owners du bot

${owners.join("\n")}`
        );
    }
};
