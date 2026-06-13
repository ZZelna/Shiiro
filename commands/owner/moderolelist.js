const config = require("../../config.json");
const { EmbedBuilder } = require("discord.js");

module.exports = {
    name: "moderolelist",

    async run(message) {

        if (!config.owner_ids.includes(message.author.id)) {
            return message.reply("❌ Cette commande est réservée aux owners.");
        }

        const roles = config.moderator_roles
            .map(id => {
                const role = message.guild.roles.cache.get(id);
                return role ? `• ${role}` : `• Rôle supprimé (${id})`;
            })
            .join("\n");

        const embed = new EmbedBuilder()
            .setColor("#5865F2")
            .setTitle("🛡️ Liste des rôles modérateurs")
            .setDescription(
                roles || "Aucun rôle modérateur configuré."
            )
            .setTimestamp();

        return message.reply({
            embeds: [embed]
        });
    }
};
