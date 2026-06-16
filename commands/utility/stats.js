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
                    value: `${
                        userStats?.messages || 0
                    }`,
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
