const {
    EmbedBuilder
} = require("discord.js");

const Marriage = require("../../models/Marriage");
const Family = require("../../models/Family");

module.exports = {
    name: "adopt",

    async run(message) {

        const target = message.mentions.members.first();

        if (!target)
            return message.reply("❌ Mentionnez un membre à adopter.");

        if (target.user.bot)
            return message.reply("❌ Vous ne pouvez pas adopter un bot.");

        if (target.id === message.author.id)
            return message.reply("❌ Vous ne pouvez pas vous adopter vous-même.");

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
            return message.reply("❌ Vous n'avez pas encore créé de famille.");

        if (family.children.includes(target.id))
            return message.reply("❌ Cette personne fait déjà partie de votre famille.");

        if (family.children.length >= 10)
            return message.reply("❌ Votre famille est complète (10 enfants maximum).");

        family.children.push(target.id);
        family.xp += 100;

        if (family.xp >= family.level * 1000) {
            family.level++;
            family.xp = 0;
        }

        await family.save();

        const embed = new EmbedBuilder()
            .setColor("#8BC34A")
            .setTitle("👶 Adoption")
            .setDescription(`${target} rejoint officiellement la famille **${family.name}** !`)
            .addFields(
                {
                    name: "👨‍👩‍👧 Parents",
                    value: family.parents.map(id => `<@${id}>`).join("\n")
                },
                {
                    name: "👶 Nombre d'enfants",
                    value: family.children.length.toString(),
                    inline: true
                },
                {
                    name: "⭐ Niveau",
                    value: family.level.toString(),
                    inline: true
                }
            )
            .setTimestamp();

        message.reply({
            embeds: [embed]
        });
    }
};
