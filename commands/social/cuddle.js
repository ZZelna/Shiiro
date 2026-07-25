const { EmbedBuilder } = require("discord.js");
const Marriage = require("../../models/Marriage");

module.exports = {
    name: "cuddle",

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

        marriage.cuddles = (marriage.cuddles || 0) + 1;
        marriage.love += 15;

        await marriage.save();

        const embed = new EmbedBuilder()
            .setColor("#FF9ECF")
            .setTitle("🥰 Moment tendre")
            .setDescription(`${message.author} se blottit contre ${target}.`)
            .addFields(
                {
                    name: "🥰 Moments tendres",
                    value: marriage.cuddles.toString(),
                    inline: true
                },
                {
                    name: "❤️ Love gagné",
                    value: "+15",
                    inline: true
                },
                {
                    name: "❤️ Love total",
                    value: marriage.love.toString(),
                    inline: true
                }
            )
            .setTimestamp();

        return message.reply({
            embeds: [embed]
        });

    }
};
