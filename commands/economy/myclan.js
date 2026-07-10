const {
    EmbedBuilder
} = require("discord.js");

const Clan = require("../../models/Clan");

module.exports = {
    name: "myclan",

    async run(message) {

        const ALLOWED_CHANNEL = "1519055718416781412";

        if (message.channel.id !== ALLOWED_CHANNEL) {
            return message.reply(
                "❌ Cette commande est uniquement utilisable dans <#1519055718416781412>."
            );
        }

        const clan = await Clan.findOne({
            members: message.author.id
        });

        if (!clan) {
            return message.reply(
                "❌ Tu n'es dans aucun clan."
            );
        }

        const members = clan.members
            .map(id => `<@${id}>`)
            .join("\n");

        const embed = new EmbedBuilder()
            .setColor("Blue")
            .setTitle(`🏰 ${clan.name}`)
            .addFields(
                {
                    name: "👑 Chef",
                    value: `<@${clan.ownerId}>`,
                    inline: true
                },
                {
                    name: "👥 Membres",
                    value: `${clan.members.length}/5`,
                    inline: true
                },
                {
                    name: "⚔️ Score GDC",
                    value: `${(clan.weeklyYens || 0).toLocaleString()} ¥`,
                    inline: true
                },
                {
                    name: "💰 Total Clan",
                    value: `${(clan.totalYens || 0).toLocaleString()} ¥`,
                    inline: true
                },
                {
                    name: "📍 Salon",
                    value: clan.channelId
                        ? `<#${clan.channelId}>`
                        : "Aucun",
                    inline: false
                },
                {
                    name: "📜 Liste des membres",
                    value: members || "Aucun membre",
                    inline: false
                }
            )
            .setTimestamp();

        return message.reply({
            embeds: [embed]
        });

    }
};
