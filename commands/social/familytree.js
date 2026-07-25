const { EmbedBuilder } = require("discord.js");

const Marriage = require("../../models/Marriage");
const Family = require("../../models/Family");

module.exports = {

    name: "familytree",

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

        let txt = "";

        family.children.forEach((c, i) => {

            txt += `👶 ${i + 1}. **${c.name}**\n`;
            txt += `Âge : ${c.age} ans\n`;
            txt += `Bonheur : ${c.happiness}%\n`;
            txt += `Santé : ${c.health}%\n\n`;

        });

        message.reply({
            embeds: [
                new EmbedBuilder()
                .setColor("#9B59B6")
                .setTitle("🌳 Arbre familial")
                .setDescription(
                    txt || "Aucun enfant."
                )
            ]
        });

    }

};
