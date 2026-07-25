const {
    EmbedBuilder
} = require("discord.js");

const Marriage = require("../../models/Marriage");
const Family = require("../../models/Family");

module.exports = {

    name: "playchild",

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

        const gain = Math.floor(Math.random() * 25) + 15;

        child.happiness = Math.min(
            100,
            child.happiness + gain
        );

        await family.save();

        const embed = new EmbedBuilder()

            .setColor("#F1C40F")

            .setTitle("🎮 Temps de jeu")

            .setDescription(
                `Vous avez joué avec **${child.name}**.`
            )

            .addFields({
                name: "😊 Bonheur",
                value: `+${gain}%`
            });

        message.reply({
            embeds: [embed]
        });

    }

};
