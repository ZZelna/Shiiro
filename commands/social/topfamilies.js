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
                yens: -1
            })
            .limit(10);

        const embed = new EmbedBuilder()

            .setColor("#FFD166")

            .setTitle("🏆 Classement des Familles")

            .setFooter({
                text: "Shiiro • Familles"
            })

            .setTimestamp();

        if (!families.length) {

            embed.setDescription(
                "Aucune famille n'a encore été créée."
            );

        } else {

            embed.setDescription(

                families.map((family, index) => {

                    const yens = family.yens || 0;
                    const level = family.level || 1;

                    return (
                        `**${index + 1}. ${family.name}**\n` +
                        `⭐ Niveau **${level}** • 💴 **${yens.toLocaleString("fr-FR")} ¥**`
                    );

                }).join("\n\n")

            );

        }

        return message.reply({
            embeds: [embed]
        });

    }

};
