const {
    EmbedBuilder
} = require("discord.js");

const Marriage = require("../../models/Marriage");
const Family = require("../../models/Family");

module.exports = {

    name: "family",

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
            return message.reply("❌ Vous n'avez pas encore créé votre famille.");

        const embed = new EmbedBuilder()

            .setColor("#4CAF50")

            .setTitle(`🏡 ${family.name}`)

            .addFields(

                {
                    name: "👑 Parents",
                    value: family.parents.map(id => `<@${id}>`).join("\n")
                },

                {
                    name: "👶 Enfants",
                    value: family.children.length
                        ? family.children.map(id => `<@${id}>`).join("\n")
                        : "Aucun"
                },

                {
                    name: "⭐ Niveau",
                    value: family.level.toString(),
                    inline: true
                },

                {
                    name: "✨ XP",
                    value: family.xp.toLocaleString("fr-FR"),
                    inline: true
                },

                {
                    name: "💰 Banque",
                    value: `${family.Yens.toLocaleString("fr-FR")} ¥`,
                    inline: true
                }

            )

            .setTimestamp();

        message.reply({
            embeds: [embed]
        });

    }

};
