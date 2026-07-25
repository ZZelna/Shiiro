const {
    EmbedBuilder
} = require("discord.js");

const Marriage = require("../../models/Marriage");
const Family = require("../../models/Family");
const Child = require("../../models/Child");

module.exports = {

    name: "family",

    async run(message) {

        const marriage = await Marriage.findOne({
            guildId: message.guild.id,
            users: message.author.id
        });

        if (!marriage)
            return message.reply("❌ Vous n'êtes pas marié.");

        const family = await Family.findOne({
            marriageId: marriage._id
        });

        if (!family)
            return message.reply(
                "❌ Vous n'avez pas encore créé votre famille."
            );

        const children = await Child.find({
            familyId: family._id
        }).sort({
            createdAt: 1
        });

        const parent1 = `<@${marriage.users[0]}>`;
        const parent2 = `<@${marriage.users[1]}>`;

        const childrenText = children.length
            ? children.map((child, index) =>
                `👶 **${index + 1}. ${child.name}** (<@${child.userId}>)
• ⚧ ${child.gender}
• 🎂 ${child.age} an(s)
• 😊 ${child.happiness}%
• ❤️ ${child.health}%
• 🧠 ${child.intelligence}%`
            ).join("\n\n")
            : "Aucun enfant.";

        const embed = new EmbedBuilder()

            .setColor("#4CAF50")

            .setTitle(`🏡 ${family.name}`)

            .addFields(

                {
                    name: "👑 Parents",
                    value: `${parent1}\n${parent2}`,
                    inline: false
                },

                {
                    name: "👶 Enfants",
                    value: childrenText,
                    inline: false
                },

                {
                    name: "⭐ Niveau",
                    value: `${family.level}`,
                    inline: true
                },

                {
                    name: "✨ XP",
                    value: `${family.xp.toLocaleString("fr-FR")}`,
                    inline: true
                },

                {
                    name: "👥 Membres",
                    value: `${children.length + 2}`,
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
