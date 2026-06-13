const config = require("../../config.json");

module.exports = {
    name: "addrole",

    async run(message, args) {

        if (!config.owner_ids.includes(message.author.id)) {
            return message.reply("❌ Cette commande est réservée aux owners.");
        }

        const member = message.mentions.members.first();
        const role = message.guild.roles.cache.get(args[1]);

        if (!member || !role) {
            return message.reply(
                "❌ Utilisation : +addrole @user <role_id>"
            );
        }

        try {

            await member.roles.add(role);

            return message.reply(
    `✅ Le rôle ${role.name} a été ajouté à ${member.user.tag}.`

} catch (err) {

            return message.reply(
                "❌ Impossible d'ajouter ce rôle."
            );

        }
    }
};
