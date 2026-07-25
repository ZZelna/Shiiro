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

        const parent1 = `<@${marriage.users[0]}>`;
        const parent2 = `<@${marriage.users[1]}>`;

        const children = family.children.length
            ? family.children.map(c =>
                `👶 **${c.name}** (<@${c.userId}>)`
            ).join("\n")
            : "Aucun enfant";

        const embed = new EmbedBuilder()

            .setColor("#4CAF50")

            .setTitle(`🏡 ${family.name}`)

            .addFields(
                {
                    name: "👑 Parents",
                    value: `${parent1}\n${parent2}`,
                    inline: false
                },
                {
                    name: "👶 Enfants",
                    value: children,
                    inline: false
                },
                {
                    name: "⭐ Niveau",
                    value: `${family.level}`,
                    inline: true
                },
                {
                    name: "✨ XP",
                    value: family.xp.toLocaleString("fr-FR"),
                    inline: true
                },
                {
                    name: "👨‍👩‍👧 Membres",
                    value: `${family.children.length + 2}`,
                    inline: true
                }
            )

            .setFooter({
                text: "Shiiro • Famille"
            })

            .setTimestamp();

        return message.reply({
            embeds: [embed]
        });

    }

};
