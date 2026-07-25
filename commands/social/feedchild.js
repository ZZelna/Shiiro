const {
    EmbedBuilder
} = require("discord.js");

const Marriage = require("../../models/Marriage");
const Family = require("../../models/Family");

module.exports = {

    name: "feedchild",

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

        child.happiness = Math.min(
            100,
            child.happiness + 15
        );

        await family.save();

        const embed = new EmbedBuilder()

            .setColor("#57F287")

            .setTitle("🍜 Repas")

            .setDescription(
                `${child.name} est heureux après son repas.`
            );

        message.reply({
            embeds: [embed]
        });

    }

};
