const {
    EmbedBuilder
} = require("discord.js");

const Marriage = require("../../models/Marriage");
const Family = require("../../models/Family");
const CasinoProfile = require("../../models/CasinoProfile");

module.exports = {

    name: "depositfamily",

    async run(message, args) {

        const amount = Number(args[0]);

        if (!Number.isInteger(amount) || amount <= 0)
            return message.reply("❌ Montant invalide.");

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

        const profile = await CasinoProfile.findOne({
            userId: message.author.id
        });

        if (!profile)
            return message.reply("❌ Profil casino introuvable.");

        if ((profile.yens || 0) < amount)
            return message.reply("❌ Vous ne possédez pas assez de yens.");

        family.yens = family.yens || 0;
        family.xp = family.xp || 0;
        family.level = family.level || 1;

        profile.yens -= amount;
        family.yens += amount;

        family.xp += Math.floor(amount / 100);

        while (family.xp >= family.level * 1000) {
            family.xp -= family.level * 1000;
            family.level++;
        }

        await profile.save();
        await family.save();

        const embed = new EmbedBuilder()

            .setColor("#2ECC71")

            .setTitle("🏦 Dépôt familial")

            .setDescription(
                `${message.author} a déposé **${amount.toLocaleString("fr-FR")} ¥** dans la banque familiale.`
            )

            .addFields(

                {
                    name: "💰 Banque familiale",
                    value: `${family.yens.toLocaleString("fr-FR")} ¥`,
                    inline: true
                },

                {
                    name: "⭐ Niveau",
                    value: `${family.level}`,
                    inline: true
                },

                {
                    name: "✨ XP",
                    value: `${family.xp}/${family.level * 1000}`,
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
