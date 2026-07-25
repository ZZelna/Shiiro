const {
    EmbedBuilder
} = require("discord.js");

const Marriage = require("../../models/Marriage");
const Family = require("../../models/Family");

module.exports = {

    name: "familydaily",

    async run(message) {

        const marriage = await Marriage.findOne({
            guildId: message.guild.id,
            users: message.author.id
        });

        if (!marriage)
            return message.reply("❌ Vous devez être marié.");

        const family = await Family.findOne({
            marriageId: marriage._id
        });

        if (!family)
            return message.reply("❌ Vous n'avez pas de famille.");

        const now = Date.now();

        if (
            family.lastDaily &&
            now - family.lastDaily < 86400000
        ) {

            const remaining = 86400000 - (now - family.lastDaily);

            const hours = Math.floor(remaining / 3600000);
            const minutes = Math.floor((remaining % 3600000) / 60000);

            return message.reply(
                `⏳ Vous pourrez récupérer votre récompense dans **${hours}h ${minutes}m**.`
            );

        }

        const reward = 25000;

        family.yens = (family.yens || 0) + reward;
        family.xp += 250;
        family.lastDaily = now;

        while (family.xp >= family.level * 1000) {
            family.xp -= family.level * 1000;
            family.level++;
        }

        await family.save();

        const embed = new EmbedBuilder()
            .setColor("#57F287")
            .setTitle("🎁 Récompense familiale")
            .setDescription(
                `Votre famille reçoit **${reward.toLocaleString("fr-FR")} ¥**.`
            )
            .addFields(
                {
                    name: "🏦 Banque familiale",
                    value: `${(family.yens || 0).toLocaleString("fr-FR")} ¥`,
                    inline: true
                },
                {
                    name: "⭐ Niveau",
                    value: family.level.toString(),
                    inline: true
                },
                {
                    name: "✨ XP",
                    value: family.xp.toLocaleString("fr-FR"),
                    inline: true
                }
            )
            .setTimestamp();

        return message.reply({
            embeds: [embed]
        });

    }

};
