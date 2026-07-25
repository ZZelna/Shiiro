const Family = require("../../models/Family");
const Marriage = require("../../models/Marriage");

module.exports = {

    name: "kickchild",

    async run(message) {

        const target = message.mentions.members.first();

        if (!target)
            return message.reply("❌ Mentionnez un enfant.");

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
            return message.reply("❌ Famille introuvable.");

        if (!family.children.includes(target.id))
            return message.reply("❌ Cette personne n'appartient pas à votre famille.");

        family.children = family.children.filter(id => id !== target.id);

        await family.save();

        return message.reply(
            `👋 ${target} a été retiré de la famille **${family.name}**.`
        );

    }

};
