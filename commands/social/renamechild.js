const {
    EmbedBuilder
} = require("discord.js");

const Marriage = require("../../models/Marriage");
const Family = require("../../models/Family");
const Child = require("../../models/Child");

module.exports = {

    name: "renamechild",

    async run(message, args) {

        const index = Number(args[0]);

        if (!index || index < 1)
            return message.reply(
                "❌ Utilisation : `*renamechild <numéro> <nouveau prénom>`"
            );

        const newName = args.slice(1).join(" ").trim();

        if (!newName)
            return message.reply(
                "❌ Vous devez choisir un nouveau prénom."
            );

        if (newName.length < 2 || newName.length > 20)
            return message.reply(
                "❌ Le prénom doit contenir entre 2 et 20 caractères."
            );

        const marriage = await Marriage.findOne({
            guildId: message.guild.id,
            users: message.author.id
        });

        if (!marriage)
            return message.reply(
                "❌ Vous devez être marié."
            );

        const family = await Family.findOne({
            marriageId: marriage._id
        });

        if (!family)
            return message.reply(
                "❌ Famille introuvable."
            );

        const children = await Child.find({
            familyId: family._id
        }).sort({
            createdAt: 1
        });

        const child = children[index - 1];

        if (!child)
            return message.reply(
                "❌ Enfant introuvable."
            );

        const oldName = child.name;

        child.name = newName;

        await child.save();

        const embed = new EmbedBuilder()

            .setColor("#F39C12")

            .setTitle("✏️ Prénom modifié")

            .setDescription(
                `Le prénom de votre enfant a été changé avec succès.`
            )

            .addFields(
                {
                    name: "Ancien prénom",
                    value: oldName,
                    inline: true
                },
                {
                    name: "Nouveau prénom",
                    value: newName,
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
