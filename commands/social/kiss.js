const { EmbedBuilder } = require("discord.js");
const Marriage = require("../../models/Marriage");

module.exports = {
    name: "kiss",

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

        marriage.kisses += 1;
        marriage.love += 10;

        await marriage.save();

        const embed = new EmbedBuilder()
            .setColor("#ff5ba7")
            .setTitle("💋 Bisou")
            .setDescription(
                `${message.author} embrasse ${target} ❤️`
            )
            .addFields(
                {
                    name: "💋 Total de bisous",
                    value: marriage.kisses.toString(),
                    inline: true
                },
                {
                    name: "❤️ Love gagné",
                    value: "+10",
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
