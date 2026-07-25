const {
    EmbedBuilder
} = require("discord.js");

const Marriage = require("../../models/Marriage");
const Family = require("../../models/Family");

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

        if (!family.children?.length)
            return message.reply("👶 Aucun enfant.");

        const embed = new EmbedBuilder()

            .setColor("#5865F2")

            .setTitle("👨‍👩‍👧‍👦 Vos enfants")

            .setDescription(

                family.children

                .map(

                    (c, i) =>

                    `**${i+1}. ${c.name}**
👤 ${c.gender}
🎂 ${c.age} an(s)
😊 ${c.happiness}%
🧠 ${c.intelligence}`

                )

                .join("\n\n")

            );

        message.reply({

            embeds: [embed]

        });

    }

};
