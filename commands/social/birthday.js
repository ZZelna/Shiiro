const {
    EmbedBuilder
} = require("discord.js");

const Marriage = require("../../models/Marriage");
const Family = require("../../models/Family");

module.exports = {

    name: "birthday",

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

        child.age++;

        let reward = "";

        if (child.age === 6)
            reward = "📚 Il peut maintenant aller à l'école.";

        if (child.age === 18)
            reward = "💼 Il est désormais majeur et peut travailler.";

        if (child.age === 25)
            reward = "💍 Il est prêt à fonder sa propre famille.";

        await family.save();

        const embed = new EmbedBuilder()

            .setColor("#FF66CC")

            .setTitle("🎂 Anniversaire")

            .setDescription(
                `🎉 **${child.name}** fête ses **${child.age} ans** !`
            );

        if (reward)
            embed.addFields({
                name: "🎁 Déblocage",
                value: reward
            });

        message.reply({
            embeds: [embed]
        });

    }

};
