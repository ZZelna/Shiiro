const whitelist = require("../../data/whitelist/users.json");
const config = require("../../config.json");
const { EmbedBuilder } = require("discord.js");

module.exports = {
    name: "unban",

    async run(message, args) {

        if (
            !whitelist.users.includes(message.author.id) &&
            !config.owner_ids.includes(message.author.id)
        ) {
            return message.reply("❌ Tu n'as pas la permission d'utiliser cette commande.");
        }

        const userId = args[0];

        if (!userId) {
            return message.reply("❌ Utilisation : +unban <id>");
        }

        try {

            await message.guild.members.unban(
                userId,
                `Unban par ${message.author.tag}`
            );

            const embed = new EmbedBuilder()
                .setColor("#57F287")
                .setTitle("🔓 Débannissement effectué")
                .addFields(
                    {
                        name: "👤 ID Utilisateur",
                        value: userId,
                        inline: true
                    },
                    {
                        name: "🛡️ Juge",
                        value: message.author.tag,
                        inline: true
                    }
                )
                .setTimestamp();

            return message.reply({
                embeds: [embed]
            });

        } catch (err) {

            return message.reply(
                "❌ Impossible de débannir cet utilisateur.\nVérifie que l'ID est correct et que la personne est bannie."
            );

        }
    }
};
