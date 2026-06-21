const Stats = require("../../systems/stats");
const createCard = require("../../utils/statsCard");
const { AttachmentBuilder } = require("discord.js");

module.exports = {

    name: "stats",

    async run(message) {

        const target =
            message.mentions.users.first() ||
            message.author;

        const userStats =
            await Stats.findOne({
                userId: target.id
            });

        let messages7d = 0;
        let messages14d = 0;

        const today = new Date();

        if (userStats?.dailyMessages) {

            for (const [date, count] of userStats.dailyMessages) {

                const diff =
                    (today - new Date(date))
                    / 86400000;

                if (diff <= 7)
                    messages7d += count;

                if (diff <= 14)
                    messages14d += count;

            }

        }

        const image =
            await createCard(
                target,
                {
                    messages:
                        userStats?.messages || 0,

                    messages7d,

                    messages14d
                }
            );

        const attachment =
            new AttachmentBuilder(
                image,
                {
                    name: "stats.png"
                }
            );

        return message.reply({
            files: [attachment]
        });

    }

};
