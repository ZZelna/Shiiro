const { EmbedBuilder } = require("discord.js");
const Marriage = require("../../models/Marriage");

module.exports = {
    name: "love",

    async run(message) {

        const marriage = await Marriage.findOne({
            guildId: message.guild.id,
            users: message.author.id
        });

        if (!marriage)
            return message.reply("❌ Vous n'êtes pas marié.");

        const partnerId = marriage.users.find(id => id !== message.author.id);

        const partner = await message.client.users
            .fetch(partnerId)
            .catch(() => null);

        const love = marriage.love || 0;

        // 1000 Love = 1 niveau
        const level = Math.floor(love / 1000) + 1;

        const currentXP = love % 1000;
        const neededXP = 1000;

        const percent = Math.floor((currentXP / neededXP) * 100);

        const filled = Math.floor(percent / 10);
        const empty = 10 - filled;

        const bar =
            "🟦".repeat(filled) +
            "⬛".repeat(empty);

        const embed = new EmbedBuilder()
            .setColor("#ff4fa3")
            .setTitle("❤️ Love")
            .setDescription(
                `${message.author} ❤️ ${partner ?? `<@${partnerId}>`}`
            )
            .addFields(
                {
                    name: "❤️ Love Points",
                    value: love.toLocaleString("fr-FR"),
                    inline: true
                },
                {
                    name: "⭐ Niveau",
                    value: `${level}`,
                    inline: true
                },
                {
                    name: "📈 Progression",
                    value:
                        `${bar}\n` +
                        `${currentXP}/1000 (${percent}%)`,
                    inline: false
                },
                {
                    name: "💋 Bisous",
                    value: `${marriage.kisses || 0}`,
                    inline: true
                },
                {
                    name: "🤗 Câlins",
                    value: `${marriage.hugs || 0}`,
                    inline: true
                },
                {
                    name: "🎁 Cadeaux",
                    value: `${marriage.gifts || 0}`,
                    inline: true
                },
                {
                    name: "🎤 Temps vocal",
                    value: `${Math.floor((marriage.voiceSeconds || 0) / 3600)} h`,
                    inline: true
                },
                {
                    name: "💬 Messages",
                    value: `${marriage.messagesTogether || 0}`,
                    inline: true
                }
            )
            .setFooter({
                text: "Continuez vos interactions pour gagner des Love Points ❤️"
            });

        return message.reply({
            embeds: [embed]
        });

    }
};
