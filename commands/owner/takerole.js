const config = require("../../config.json");

module.exports = {
    name: "takerole",

    async run(message) {

        if (!config.owner_ids.includes(message.author.id)) {
            return message.reply("❌ Cette commande est réservée aux owners.");
        }

        const member = message.mentions.members.first();
        const role = message.mentions.roles.first();

        if (!member || !role) {
            return message.reply(
                "❌ Utilisation : +takerole @user @role"
            );
        }

        try {

            await member.roles.remove(role);

            return message.reply(
    `✅ Le rôle ${role} a été retiré à ${member.user.tag}.`
);

        } catch (err) {

            return message.reply(
                "❌ Impossible de retirer ce rôle."
            );

        }
    }
};
