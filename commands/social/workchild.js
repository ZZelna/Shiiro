const { EmbedBuilder } = require("discord.js");

const Marriage = require("../../models/Marriage");
const Family = require("../../models/Family");
const CasinoProfile = require("../../models/CasinoProfile");

module.exports = {

    name: "workchild",

    async run(message, args) {

        const index = Number(args[0]) - 1;

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
            return;

        const child = family.children[index];

        if (!child)
            return message.reply("❌ Enfant introuvable.");

        if (child.age < 18)
            return message.reply("👶 Cet enfant est trop jeune pour travailler.");

        if (child.lastWork && Date.now() - child.lastWork < 86400000)
            return message.reply("💼 Cet enfant a déjà travaillé aujourd'hui.");

        const salary = Math.floor(Math.random() * 2500) + 1500;

        child.lastWork = Date.now();

        let profile = await CasinoProfile.findOne({
            userId: message.author.id
        });

        if (!profile)
            profile = await CasinoProfile.create({
                userId: message.author.id
            });

        profile.coins += salary;

        await profile.save();
        await family.save();

        message.reply({
            embeds: [
                new EmbedBuilder()
                .setColor("Green")
                .setTitle("💼 Premier salaire")
                .setDescription(
                    `**${child.name}** est allé travailler.\n\n💴 +${salary.toLocaleString()} yens`
                )
            ]
        });

    }

};
