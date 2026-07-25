const { EmbedBuilder } = require("discord.js");

const Marriage = require("../../models/Marriage");
const Family = require("../../models/Family");
const Child = require("../../models/Child");
const CasinoProfile = require("../../models/CasinoProfile");

module.exports = {

    name: "workchild",

    async run(message, args) {

        const index = Number(args[0]);

        if (!index || index < 1)
            return message.reply(
                "❌ Utilisation : `*workchild <numéro>`"
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

        if (child.age < 18)
            return message.reply(
                "👶 Cet enfant est trop jeune pour travailler."
            );

        if (
            child.lastWork &&
            Date.now() - child.lastWork < 86400000
        )
            return message.reply(
                "💼 Cet enfant a déjà travaillé aujourd'hui."
            );

        const salary = Math.floor(Math.random() * 2500) + 1500;

        child.lastWork = Date.now();
        child.salary = salary;
        child.job = child.job || "Employé";

        let profile = await CasinoProfile.findOne({
            userId: message.author.id
        });

        if (!profile)
            profile = await CasinoProfile.create({
                userId: message.author.id
            });

        profile.yens = (profile.yens || 0) + salary;

        child.xp += 30;

        while (child.xp >= child.level * 100) {
            child.xp -= child.level * 100;
            child.level++;
        }

        await child.save();
        await profile.save();

        const embed = new EmbedBuilder()

            .setColor("Green")

            .setTitle("💼 Journée de travail")

            .setDescription(
                `**${child.name}** est allé travailler aujourd'hui.`
            )

            .addFields(

                {
                    name: "💴 Salaire",
                    value: `${salary.toLocaleString("fr-FR")} ¥`,
                    inline: true
                },

                {
                    name: "👔 Métier",
                    value: child.job,
                    inline: true
                },

                {
                    name: "⭐ Niveau",
                    value: `${child.level}`,
                    inline: true
                },

                {
                    name: "🧠 XP gagnée",
                    value: "+30",
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
