const {
    EmbedBuilder
} = require("discord.js");

const Marriage = require("../../models/Marriage");
const Family = require("../../models/Family");
const Child = require("../../models/Child");

module.exports = {

    name: "children",

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
            return message.reply("❌ Famille introuvable.");

        const children = await Child.find({
            familyId: family._id
        }).sort({
            createdAt: 1
        });

        if (!children.length)
            return message.reply("👶 Vous n'avez aucun enfant.");

        const embed = new EmbedBuilder()

            .setColor("#5865F2")

            .setTitle("👨‍👩‍👧‍👦 Vos enfants")

            .setDescription(

                children.map((child, i) =>

                    `## 👶 Enfant ${i + 1}

**Prénom :** ${child.name}
**Membre :** <@${child.userId}>
**Genre :** ${child.gender}
**Âge :** ${child.age} an(s)
**Bonheur :** ${child.happiness}%
**Santé :** ${child.health}%
**Intelligence :** ${child.intelligence}%
**Niveau :** ${child.level}
**XP :** ${child.xp}`

                ).join("\n\n━━━━━━━━━━━━━━\n\n")

            )

            .setFooter({
                text: `${children.length} enfant(s)`
            })

            .setTimestamp();

        return message.reply({
            embeds: [embed]
        });

    }

};
