const { EmbedBuilder } = require("discord.js");
const Marriage = require("../../models/Marriage");

module.exports = {
    name: "hug",

    async run(message) {

        const target = message.mentions.members.first();

        if (!target)
            return message.reply("❌ Mentionnez votre partenaire.");

        const marriage = await Marriage.findOne({
            guildId: message.guild.id,
            users: message.author.id
        });

        if (!marriage)
            return message.reply("❌ Vous n'êtes pas marié.");

        if (!marriage.users.includes(target.id))
            return message.reply("❌ Cette personne n'est pas votre partenaire.");

        marriage.hugs = (marriage.hugs || 0) + 1;
        marriage.love = (marriage.love || 0) + 8;

        await marriage.save();

        const embed = new EmbedBuilder()
            .setColor("#6BCBFF")
            .setTitle("🤗 Câlin")
            .setDescription(
                `${message.author} fait un énorme câlin à ${target} ❤️`
            )
            .addFields(
                {
                    name: "🤗 Câlins",
                    value: `${marriage.hugs}`,
                    inline: true
                },
                {
                    name: "❤️ Love gagné",
                    value: "+8",
                    inline: true
                },
                {
                    name: "💖 Love total",
                    value: `${marriage.love.toLocaleString("fr-FR")}`,
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
