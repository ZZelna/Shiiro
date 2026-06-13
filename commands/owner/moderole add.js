const fs = require("fs");
const config = require("../../config.json");

module.exports = {
    name: "moderole",

    async run(message, args) {

        if (!config.owner_ids.includes(message.author.id)) {
            return message.reply("❌ Cette commande est réservée aux owners.");
        }

        if (args[0] !== "add") return;

        const role = message.mentions.roles.first();

        if (!role) {
            return message.reply(
                "❌ Utilisation : +moderole add @role"
            );
        }

        if (config.moderator_roles.includes(role.id)) {
            return message.reply(
                "❌ Ce rôle est déjà modérateur."
            );
        }

        config.moderator_roles.push(role.id);

        fs.writeFileSync(
            "./config.json",
            JSON.stringify(config, null, 2)
        );

        return message.reply(
            ✅ ${role.name} a été ajouté aux rôles modérateurs.
        );
    }
};const fs = require("fs");
const config = require("../../config.json");

module.exports = {
    name: "moderole",

    async run(message, args) {

        if (!config.owner_ids.includes(message.author.id)) {
            return message.reply("❌ Cette commande est réservée aux owners.");
        }

        if (args[0] !== "add") return;

        const role = message.mentions.roles.first();

        if (!role) {
            return message.reply(
                "❌ Utilisation : +moderole add @role"
            );
        }

        if (config.moderator_roles.includes(role.id)) {
            return message.reply(
                "❌ Ce rôle est déjà modérateur."
            );
        }

        config.moderator_roles.push(role.id);

        fs.writeFileSync(
            "./config.json",
            JSON.stringify(config, null, 2)
        );

        return message.reply(
    `✅ ${role.name} a été ajouté aux rôles modérateurs.`
);
    }
};
