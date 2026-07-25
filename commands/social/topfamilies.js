const {
    EmbedBuilder
} = require("discord.js");

const Family = require("../../models/Family");

module.exports = {

    name: "topfamilies",

    async run(message) {

        const families = await Family.find()
            .sort({
                level: -1,
                coins: -1
            })
            .limit(10);

        const embed = new EmbedBuilder()

            .setColor("#FFD166")

            .setTitle("🏆 Classement des Familles");

        if (!families.length) {

            embed.setDescription("Aucune famille.");

        } else {

            embed.setDescription(

                families.map((f, i) =>

                    `**${i + 1}. ${f.name}**\n⭐ Niveau ${f.level} • 💰 ${f.coins.toLocaleString("fr-FR")} ¥`

                ).join("\n\n")

            );

        }

        message.reply({
            embeds: [embed]
        });

    }

};
