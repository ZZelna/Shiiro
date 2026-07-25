const {
    EmbedBuilder
} = require("discord.js");

const Marriage = require("../../models/Marriage");
const Family = require("../../models/Family");

module.exports = {

    name: "startfamily",

    async run(message, args) {

        const familyName = args.join(" ").trim();

        if (!familyName)
            return message.reply(
                "❌ Donnez un nom à votre famille."
            );

        if (familyName.length > 30)
            return message.reply(
                "❌ Le nom de famille ne peut pas dépasser 30 caractères."
            );

        const marriage = await Marriage.findOne({
            guildId: message.guild.id,
            users: message.author.id
        });

        if (!marriage)
            return message.reply(
                "❌ Vous devez être marié."
            );

        const already = await Family.findOne({
            marriageId: marriage._id
        });

        if (already)
            return message.reply(
                "❌ Vous possédez déjà une famille."
            );

        const family = await Family.create({

            guildId: message.guild.id,

            marriageId: marriage._id,

            ownerId: message.author.id,

            name: familyName,

            members: marriage.users,

            children: [],

            yens: 0,

            xp: 0,

            level: 1,

            maxChildren: 3,

            lastBaby: null

        });

        const embed = new EmbedBuilder()

            .setColor("#7ED957")

            .setTitle("👨‍👩‍👧 Nouvelle famille")

            .setDescription(
                `🎉 La famille **${family.name}** vient d'être fondée !`
            )

            .addFields(

                {
                    name: "👑 Parents",
                    value: marriage.users
                        .map(id => `<@${id}>`)
                        .join("\n")
                },

                {
                    name: "👥 Membres",
                    value: `${family.members.length}`,
                    inline: true
                },

                {
                    name: "🏡 Niveau",
                    value: `${family.level}`,
                    inline: true
                },

                {
                    name: "💴 Banque",
                    value: `${family.yens.toLocaleString("fr-FR")} ¥`,
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
