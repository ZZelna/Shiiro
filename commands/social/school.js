const {
    EmbedBuilder
} = require("discord.js");

const Marriage = require("../../models/Marriage");
const Family = require("../../models/Family");

module.exports = {

    name: "school",

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
            return message.reply("❌ Famille introuvable.");

        const child = family.children[index];

        if (!child)
            return message.reply("❌ Enfant introuvable.");

        if (child.lastSchool && Date.now() - child.lastSchool < 43200000)
            return message.reply("📚 Cet enfant est déjà allé à l'école récemment.");

        const intelligence = Math.floor(Math.random() * 15) + 10;
        const happiness = Math.floor(Math.random() * 5);

        child.intelligence += intelligence;
        child.happiness = Math.max(0, child.happiness - happiness);
        child.lastSchool = Date.now();

        await family.save();

        const embed = new EmbedBuilder()

            .setColor("#3498DB")

            .setTitle("📚 Journée d'école")

            .setDescription(
                `**${child.name}** revient de l'école !`
            )

            .addFields(
                {
                    name: "🧠 Intelligence",
                    value: `+${intelligence}`,
                    inline: true
                },
                {
                    name: "😊 Bonheur",
                    value: `-${happiness}`,
                    inline: true
                }
            );

        message.reply({
            embeds: [embed]
        });

    }

};
