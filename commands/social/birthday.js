const {
    EmbedBuilder
} = require("discord.js");

const Marriage = require("../../models/Marriage");
const Family = require("../../models/Family");
const Child = require("../../models/Child");

module.exports = {

    name: "birthday",

    async run(message, args) {

        const index = Number(args[0]) - 1;

        if (isNaN(index) || index < 0)
            return message.reply(
                "❌ Utilisation : `*birthday <numéro de l'enfant>`"
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

        const child = children[index];

        if (!child)
            return message.reply(
                "❌ Enfant introuvable."
            );

        child.age++;

        let reward = "";

        switch (child.age) {

            case 6:
                reward = "📚 Il peut maintenant aller à l'école.";
                break;

            case 18:
                reward = "💼 Il est désormais majeur et peut travailler.";
                break;

            case 25:
                reward = "💍 Il est prêt à fonder sa propre famille.";
                break;

        }

        await child.save();

        const embed = new EmbedBuilder()

            .setColor("#FF66CC")

            .setTitle("🎂 Anniversaire")

            .setDescription(
                `🎉 **${child.name}** fête aujourd'hui ses **${child.age} ans** !`
            )

            .addFields(
                {
                    name: "👤 Membre",
                    value: `<@${child.userId}>`,
                    inline: true
                },
                {
                    name: "⚧ Genre",
                    value: child.gender,
                    inline: true
                },
                {
                    name: "🎂 Âge",
                    value: `${child.age} ans`,
                    inline: true
                }
            )

            .setTimestamp();

        if (reward) {

            embed.addFields({
                name: "🎁 Déblocage",
                value: reward
            });

        }

        return message.reply({
            embeds: [embed]
        });

    }

};
