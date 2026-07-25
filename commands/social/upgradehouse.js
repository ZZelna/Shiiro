const { EmbedBuilder } = require("discord.js");

const Marriage = require("../../models/Marriage");
const Family = require("../../models/Family");
const CasinoProfile = require("../../models/CasinoProfile");

const prices = [
    0,
    50000,
    150000,
    350000,
    700000,
    1500000
];

module.exports = {

    name: "upgradehouse",

    async run(message) {

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

        const profile = await CasinoProfile.findOne({
            userId: message.author.id
        });

        if (!profile)
            return message.reply(
                "❌ Profil casino introuvable."
            );

        family.houseLevel = family.houseLevel || 0;

        if (family.houseLevel >= prices.length - 1)
            return message.reply(
                "🏰 Votre maison est déjà au niveau maximum."
            );

        const price = prices[family.houseLevel + 1];

        if ((profile.yens || 0) < price)
            return message.reply(
                `💴 Il vous faut **${price.toLocaleString("fr-FR")} ¥** pour améliorer votre maison.`
            );

        profile.yens -= price;
        family.houseLevel++;

        await profile.save();
        await family.save();

        const embed = new EmbedBuilder()

            .setColor("Gold")

            .setTitle("🏠 Maison améliorée")

            .setDescription(
                `Votre maison passe au **niveau ${family.houseLevel}** !`
            )

            .addFields(
                {
                    name: "💴 Coût",
                    value: `${price.toLocaleString("fr-FR")} ¥`,
                    inline: true
                },
                {
                    name: "🏡 Nouveau niveau",
                    value: `${family.houseLevel}`,
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
