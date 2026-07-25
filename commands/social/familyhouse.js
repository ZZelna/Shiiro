const { EmbedBuilder } = require("discord.js");

const Marriage = require("../../models/Marriage");
const Family = require("../../models/Family");

const houses = [
    "🏕️ Campement",
    "🏠 Petite maison",
    "🏡 Maison familiale",
    "🏘️ Villa",
    "🏛️ Manoir",
    "🏰 Château"
];

module.exports = {

    name: "familyhouse",

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
            return;

        message.reply({
            embeds: [
                new EmbedBuilder()
                .setColor("#F39C12")
                .setTitle("🏡 Votre maison")
                .setDescription(
                    `**Niveau : ${family.houseLevel}**\n\n${houses[family.houseLevel]}`
                )
            ]
        });

    }

};
