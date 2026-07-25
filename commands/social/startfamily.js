const {
    EmbedBuilder
} = require("discord.js");

const Marriage = require("../../models/Marriage");
const Family = require("../../models/Family");

module.exports = {
    name: "startfamily",

    async run(message, args) {

        const familyName = args.join(" ");

        if (!familyName)
            return message.reply("❌ Donnez un nom à votre famille.");

        const marriage = await Marriage.findOne({
            guildId: message.guild.id,
            users: message.author.id
        });

        if (!marriage)
            return message.reply("❌ Vous devez être marié.");

        const already = await Family.findOne({
            marriageId: marriage._id
        });

        if (already)
            return message.reply("❌ Vous possédez déjà une famille.");

        const family = await Family.create({

            guildId: message.guild.id,

            marriageId: marriage._id,

            name: familyName,

            parents: marriage.users,

            children: [],

            coins: 0,

            xp: 0,

            level: 1

        });

        const embed = new EmbedBuilder()

            .setColor("#7ED957")

            .setTitle("👨‍👩‍👧 Nouvelle famille")

            .setDescription(
                `La famille **${family.name}** vient d'être fondée !`
            )

            .addFields(
                {
                    name: "👑 Parents",
                    value: marriage.users.map(id => `<@${id}>`).join("\n")
                },
                {
                    name: "🏡 Niveau",
                    value: "1",
                    inline: true
                },
                {
                    name: "💰 Banque",
                    value: "0 ¥",
                    inline: true
                }
            )

            .setTimestamp();

        return message.reply({
            embeds: [embed]
        });

    }

};
