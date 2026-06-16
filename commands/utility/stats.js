const Stats =
require("../../systems/stats");

const {
EmbedBuilder
} = require("discord.js");

module.exports = {

name: "stats",
async run(message) {
    const target =
        message.mentions.users.first()
        || message.author;
    const userStats =
        await Stats.findOne({
            userId: target.id
        });
    let messages14d = 0;
    const today =
        new Date();
    if (
        userStats?.dailyMessages
    ) {
        for (
            const [date, count]
            of userStats.dailyMessages
        ) {
            const diff =
                (
                    today -
                    new Date(date)
                ) / 86400000;
            if (diff <= 14) {
                messages14d += count;
            }
        }
    }
    const embed =
        new EmbedBuilder()
        .setColor("Blue")
        .setTitle(
            "📊 Statistiques"
        )
        .setThumbnail(
            target.displayAvatarURL({
                dynamic: true
            })
        )
        .addFields(
            {
                name: "💬 Messages",
                value: `${userStats?.messages || 0}`,
                inline: true
            },
            {
                name: "📅 14 jours",
                value: `${messages14d}`,
                inline: true
            },
            {
                name: "⭐ XP",
                value: `${userStats?.xp || 0}`,
                inline: true
            },
            {
                name: "🏆 Niveau",
                value: `${userStats?.level || 1}`,
                inline: true
            }
        )
        .setFooter({
            text:
                target.username
        })
        .setTimestamp();
    return message.reply({
        embeds: [embed]
    });
}

};
