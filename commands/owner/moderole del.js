const fs = require("fs");
const config = require("../../config.json");

module.exports = {
    name: "moderole",

    async run(message, args) {

        if (!config.owner_ids.includes(message.author.id)) {
            return message.reply("❌ Cette commande est réservée aux owners.");
        }

        if (args[0] !== "del") return;

        const role = message.mentions.roles.first();

        if (!role) {
            return message.reply(
                "❌ Utilisation : +moderole del @role"
            );
        }

        if (!config.moderator_roles.includes(role.id)) {
            return message.reply(
                "❌ Ce rôle n'est pas modérateur."
            );
        }

        config.moderator_roles = config.moderator_roles.filter(
            id => id !== role.id
        );

        fs.writeFileSync(
            "./config.json",
            JSON.stringify(config, null, 2)
        );

        return message.reply(
    `✅ ${role.name} a été retiré des rôles modérateurs.`
);
    }
};
