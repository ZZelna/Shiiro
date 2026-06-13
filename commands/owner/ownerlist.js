const config = require("../../config.json");
const { EmbedBuilder } = require("discord.js");

module.exports = {
    name: "ownerlist",

    async run(message) {

        if (!config.owner_ids.includes(message.author.id)) {
            return message.reply("❌ Cette commande est réservée aux owners.");
        }

        const owners = [];

        for (const id of config.owner_ids) {

            const user = await message.client.users
                .fetch(id)
                .catch(() => null);

            owners.push(
                user
                    ? `👑 ${user.tag}\n\`${id}\``
                    : `❓ Utilisateur inconnu\n\`${id}\``
            );
        }

        const embed = new EmbedBuilder()
            .setColor("#5865F2")
            .setTitle("👑 Liste des Owners")
            .setDescription(owners.join("\n\n"))
            .setFooter({
                text: `${config.owner_ids.length} owner(s)`
            })
            .setTimestamp();

        return message.reply({
            embeds: [embed]
        });
    }
};
