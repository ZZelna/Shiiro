const {
    EmbedBuilder
} = require("discord.js");

const Marriage = require("../../models/Marriage");
const Family = require("../../models/Family");
const Child = require("../../models/Child");

module.exports = {

    name: "playchild",

    async run(message, args) {

        const index = Number(args[0]);

        if (!index || index < 1)
            return message.reply(
                "❌ Utilisation : `*playchild <numéro>`"
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

        const happinessGain = Math.floor(Math.random() * 25) + 15;
        const intelligenceGain = Math.floor(Math.random() * 6) + 2;

        child.happiness = Math.min(
            100,
            (child.happiness || 0) + happinessGain
        );

        child.intelligence = Math.min(
            100,
            (child.intelligence || 0) + intelligenceGain
        );

        child.xp += 20;

        while (child.xp >= child.level * 100) {
            child.xp -= child.level * 100;
            child.level++;
        }

        await child.save();

        const embed = new EmbedBuilder()

            .setColor("#F1C40F")

            .setTitle("🎮 Temps de jeu")

            .setDescription(
                `Vous avez joué avec **${child.name}**.`
            )

            .addFields(

                {
                    name: "😊 Bonheur",
                    value: `+${happinessGain}%`,
                    inline: true
                },

                {
                    name: "🧠 Intelligence",
                    value: `+${intelligenceGain}`,
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
