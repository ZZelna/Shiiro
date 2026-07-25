const {
    EmbedBuilder
} = require("discord.js");

const Marriage = require("../../models/Marriage");

module.exports = {

    name: "cuddle",

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

        marriage.cuddles = (marriage.cuddles || 0) + 1;
        marriage.hugs = (marriage.hugs || 0) + 1;
        marriage.love = (marriage.love || 0) + 15;

        await marriage.save();

        const embed = new EmbedBuilder()

            .setColor("#FF9ECF")

            .setTitle("🥰 Câlin")

            .setDescription(
                `${message.author} fait un gros câlin à ${target} ❤️`
            )

            .addFields(

                {
                    name: "🤗 Câlins",
                    value: `${marriage.hugs}`,
                    inline: true
                },

                {
                    name: "🥰 Moments tendres",
                    value: `${marriage.cuddles}`,
                    inline: true
                },

                {
                    name: "❤️ Amour gagné",
                    value: "+15",
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
