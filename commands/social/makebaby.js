const {
    EmbedBuilder
} = require("discord.js");

const Marriage = require("../../models/Marriage");
const Family = require("../../models/Family");

module.exports = {

    name: "makebaby",

    async run(message, args) {

        const childMember = message.mentions.members.first();

        if (!childMember)
            return message.reply(
                "❌ Utilisation : `*makebaby @enfant`"
            );

        if (childMember.user.bot)
            return message.reply(
                "❌ Un bot ne peut pas être votre enfant."
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

        if (!family.children)
            family.children = [];

        const alreadyChild = family.children.find(
            c => c.userId === childMember.id
        );

        if (alreadyChild)
            return message.reply(
                "❌ Cette personne fait déjà partie de votre famille."
            );

        if (family.children.length >= (family.maxChildren || 3))
            return message.reply(
                "👶 Votre famille est complète."
            );

        if (
            family.lastBaby &&
            Date.now() - family.lastBaby < 86400000
        ) {
            return message.reply(
                "🍼 Vous devez attendre 24 heures avant un nouvel enfant."
            );
        }

        await message.reply(
            `👶 Quel sera le prénom de ${childMember} ?\nVous avez **60 secondes** pour répondre.`
        );

        const filter = m =>
            m.author.id === message.author.id &&
            m.channel.id === message.channel.id;

        const collected = await message.channel.awaitMessages({
            filter,
            max: 1,
            time: 60000
        }).catch(() => null);

        if (!collected || !collected.first())
            return message.reply(
                "⌛ Temps écoulé."
            );

        const firstName = collected.first().content.trim();

        if (firstName.length < 2 || firstName.length > 20)
            return message.reply(
                "❌ Le prénom doit contenir entre 2 et 20 caractères."
            );

        const gender =
            Math.random() < 0.5
                ? "Garçon"
                : "Fille";

        family.children.push({

            userId: childMember.id,

            name: firstName,

            gender,

            age: 0,

            happiness: 100,

            intelligence: 0,

            createdAt: Date.now()

        });

        family.lastBaby = Date.now();

        await family.save();

        const embed = new EmbedBuilder()

            .setColor("#FF9FF3")

            .setTitle("👶 Naissance")

            .setDescription(
                `${childMember} rejoint officiellement votre famille !`
            )

            .addFields(
                {
                    name: "Prénom",
                    value: firstName,
                    inline: true
                },
                {
                    name: "Genre",
                    value: gender,
                    inline: true
                },
                {
                    name: "Âge",
                    value: "0 an",
                    inline: true
                }
            )

            .setFooter({
                text: "Bienvenue dans la famille ❤️"
            });

        return message.reply({
            embeds: [embed]
        });

    }

};
