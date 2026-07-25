const {
    EmbedBuilder
} = require("discord.js");

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
}).populate("children");

        if (!family)
            return message.reply("❌ Aucune famille trouvée.");

        const partnerId = marriage.users.find(
            id => id !== message.author.id
        );

        let description =
            `👨 **Parent 1 :** <@${message.author.id}>\n` +
            `👩 **Parent 2 :** <@${partnerId}>\n\n`;

        if (!family.children.length) {

            description += "👶 Aucun enfant pour le moment.";

        } else {

            family.children.forEach((child, index) => {

                description +=
                    `### 👶 Enfant ${index + 1}\n` +
                    `**Membre :** <@${child.userId}>\n` +
                    `**Prénom :** ${child.name}\n` +
                    `**Genre :** ${child.gender}\n` +
                    `**Âge :** ${child.age} an(s)\n` +
                    `**Bonheur :** ${child.happiness}%\n` +
                    `**Intelligence :** ${child.intelligence}%\n\n`;

            });

        }

        const embed = new EmbedBuilder()
            .setColor("#9B59B6")
            .setTitle("🌳 Arbre familial")
            .setDescription(description)
            .setFooter({
                text: `${family.children.length} enfant(s)`
            });

        return message.reply({
            embeds: [embed]
        });

    }

};
