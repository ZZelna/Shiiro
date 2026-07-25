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
            return message.reply("❌ Vous n'avez pas encore de famille.");

        const level = Math.max(
            0,
            Math.min(family.houseLevel || 0, houses.length - 1)
        );

        const embed = new EmbedBuilder()
            .setColor("#F39C12")
            .setTitle("🏡 Maison familiale")
            .setDescription(houses[level])
            .addFields(
                {
                    name: "🏠 Niveau",
                    value: `${level + 1}/${houses.length}`,
                    inline: true
                },
                {
                    name: "👨‍👩‍👧 Famille",
                    value: family.name,
                    inline: true
                },
                {
                    name: "💰 Banque",
                    value: `${(family.yens || 0).toLocaleString("fr-FR")} ¥`,
                    inline: true
                }
            )
            .setFooter({
                text: "Améliorez votre maison pour débloquer de nouveaux niveaux."
            });

        return message.reply({
            embeds: [embed]
        });

    }

};
