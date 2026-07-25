const {
    EmbedBuilder
} = require("discord.js");

const Marriage = require("../../models/Marriage");

module.exports = {

    name: "kiss",

    async run(message) {

        const target = message.mentions.members.first();

        if (!target)
            return message.reply(
                "❌ Mentionnez votre partenaire."
            );

        const marriage = await Marriage.findOne({
            guildId: message.guild.id,
            users: message.author.id
        });

        if (!marriage)
            return message.reply(
                "❌ Vous n'êtes pas marié."
            );

        if (!marriage.users.includes(target.id))
            return message.reply(
                "❌ Cette personne n'est pas votre partenaire."
            );

        marriage.kisses = (marriage.kisses || 0) + 1;
        marriage.love = (marriage.love || 0) + 10;

        await marriage.save();

        const embed = new EmbedBuilder()

            .setColor("#FF5BA7")

            .setTitle("💋 Bisou")

            .setDescription(
                `${message.author} embrasse tendrement ${target} ❤️`
            )

            .addFields(

                {
                    name: "💋 Bisous",
                    value: `${marriage.kisses}`,
                    inline: true
                },

                {
                    name: "❤️ Amour gagné",
                    value: "+10",
                    inline: true
                },

                {
                    name: "💖 Amour total",
                    value: `${marriage.love}`,
                    inline: true
                }

            )

            .setFooter({
                text: "Shiiro • Couple"
            })

            .setTimestamp();

        return message.reply({
            embeds: [embed]
        });

    }

};
