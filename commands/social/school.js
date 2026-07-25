const {
    EmbedBuilder
} = require("discord.js");

const Marriage = require("../../models/Marriage");
const Family = require("../../models/Family");
const Child = require("../../models/Child");

module.exports = {

    name: "school",

    async run(message, args) {

        const index = Number(args[0]);

        if (!index || index < 1)
            return message.reply(
                "❌ Utilisation : `*school <numéro>`"
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

        if (child.age < 6)
            return message.reply(
                "👶 Cet enfant est trop jeune pour aller à l'école."
            );

        if (
            child.lastSchool &&
            Date.now() - child.lastSchool < 43200000
        )
            return message.reply(
                "📚 Cet enfant est déjà allé à l'école récemment."
            );

        const intelligence = Math.floor(Math.random() * 15) + 10;
        const happiness = Math.floor(Math.random() * 5);
        const xp = Math.floor(Math.random() * 30) + 20;

        child.intelligence = Math.min(
            100,
            (child.intelligence || 0) + intelligence
        );

        child.happiness = Math.max(
            0,
            (child.happiness || 0) - happiness
        );

        child.xp = (child.xp || 0) + xp;
        child.lastSchool = Date.now();

        while (child.xp >= child.level * 100) {
            child.xp -= child.level * 100;
            child.level++;
        }

        await child.save();

        const embed = new EmbedBuilder()

            .setColor("#3498DB")

            .setTitle("📚 Journée d'école")

            .setDescription(
                `**${child.name}** revient de l'école !`
            )

            .addFields(

                {
                    name: "🧠 Intelligence",
                    value: `+${intelligence}`,
                    inline: true
                },

                {
                    name: "😊 Bonheur",
                    value: `-${happiness}`,
                    inline: true
                },

                {
                    name: "⭐ XP",
                    value: `+${xp}`,
                    inline: true
                },

                {
                    name: "🏅 Niveau",
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
