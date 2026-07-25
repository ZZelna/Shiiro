const {
    EmbedBuilder
} = require("discord.js");

const Marriage = require("../../models/Marriage");
const Family = require("../../models/Family");

const names = [
    "Akira",
    "Yuki",
    "Ren",
    "Sora",
    "Haru",
    "Aiko",
    "Miyu",
    "Kaito",
    "Noa",
    "Shiro",
    "Kaori",
    "Rin",
    "Leo",
    "Eden",
    "Sena",
    "Hina",
    "Yuna",
    "Itsuki"
];

module.exports = {

    name: "makebaby",

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
            return message.reply("❌ Famille introuvable.");

        if (!family.children)
            family.children = [];

        const maxChildren = family.maxChildren || 3;

        if (family.children.length >= maxChildren)
            return message.reply("👶 Votre famille est déjà complète.");

        if (
            family.lastBaby &&
            Date.now() - family.lastBaby < 86400000
        ) {

            return message.reply(
                "🍼 Vous devez attendre avant d'avoir un nouvel enfant."
            );

        }

        if (Math.random() > 0.70)
            return message.reply(
                "😅 Aucun bébé aujourd'hui... Réessayez demain."
            );

        const gender =
            Math.random() < 0.5
                ? "Garçon"
                : "Fille";

        const child = {

            id: Date.now().toString(),

            name: names[
                Math.floor(Math.random() * names.length)
            ],

            gender,

            age: 0,

            happiness: 100,

            intelligence: 0,

            createdAt: Date.now()

        };

        family.children.push(child);

        family.lastBaby = Date.now();

        await family.save();

        const embed = new EmbedBuilder()

            .setColor("#FF9FF3")

            .setTitle("👶 Naissance")

            .setDescription(
                `Bienvenue à **${child.name}** !`
            )

            .addFields(

                {
                    name: "Genre",
                    value: child.gender,
                    inline: true
                },

                {
                    name: "Âge",
                    value: "0 an",
                    inline: true
                }

            );

        message.reply({
            embeds: [embed]
        });

    }

};
