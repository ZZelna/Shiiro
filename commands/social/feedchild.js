const {
    EmbedBuilder
} = require("discord.js");

const Marriage = require("../../models/Marriage");
const Family = require("../../models/Family");
const Child = require("../../models/Child");

module.exports = {

    name: "feedchild",

    async run(message, args) {

        const index = Number(args[0]);

        if (!index || index < 1)
            return message.reply(
                "❌ Utilisation : `*feedchild <numéro>`"
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

        const children = await Child.find({
            familyId: family._id
        }).sort({
            createdAt: 1
        });

        const child = children[index - 1];

        if (!child)
            return message.reply(
                "❌ Enfant introuvable."
            );

        child.happiness = Math.min(
            100,
            (child.happiness || 0) + 15
        );

        child.health = Math.min(
            100,
            (child.health || 0) + 5
        );

        child.xp += 10;

        while (child.xp >= child.level * 100) {
            child.xp -= child.level * 100;
            child.level++;
        }

        await child.save();

        const embed = new EmbedBuilder()

            .setColor("#57F287")

            .setTitle("🍜 Repas")

            .setDescription(
                `**${child.name}** a bien mangé !`
            )

            .addFields(

                {
                    name: "😊 Bonheur",
                    value: `${child.happiness}%`,
                    inline: true
                },

                {
                    name: "❤️ Santé",
                    value: `${child.health}%`,
                    inline: true
                },

                {
                    name: "⭐ Niveau",
                    value: `${child.level}`,
                    inline: true
                }

            )

            .setFooter({
                text: "Shiiro • Famille"
            })

            .setTimestamp();

        return message.reply({
            embeds: [embed]
        });

    }

};
