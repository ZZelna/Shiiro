const Marriage = require("../../models/Marriage");
const Family = require("../../models/Family");
const Child = require("../../models/Child");

module.exports = {

    name: "kickchild",

    async run(message) {

        const target = message.mentions.members.first();

        if (!target)
            return message.reply(
                "❌ Mentionnez un enfant."
            );

        const marriage = await Marriage.findOne({
            guildId: message.guild.id,
            users: message.author.id
        });

        if (!marriage)
            return message.reply(
                "❌ Vous devez être marié."
            );

        const family = await Family.findOne({
            marriageId: marriage._id
        });

        if (!family)
            return message.reply(
                "❌ Famille introuvable."
            );

        const child = await Child.findOne({
            familyId: family._id,
            userId: target.id
        });

        if (!child)
            return message.reply(
                "❌ Cette personne n'appartient pas à votre famille."
            );

        await Child.deleteOne({
            _id: child._id
        });

        return message.reply(
            `👋 ${target} a été retiré de la famille **${family.name}**.`
        );

    }

};
