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
            return;

        const family = await Family.findOne({
            marriageId: marriage._id
        });

        const profile = await CasinoProfile.findOne({
            userId: message.author.id
        });

        if (family.houseLevel >= 5)
            return message.reply("🏰 Maison déjà au niveau maximum.");

        const price = prices[family.houseLevel + 1];

        if (profile.coins < price)
            return message.reply(`💴 Il vous faut ${price.toLocaleString()} yens.`);

        profile.coins -= price;

        family.houseLevel++;

        await profile.save();
        await family.save();

        message.reply({
            embeds: [
                new EmbedBuilder()
                .setColor("Gold")
                .setTitle("🏠 Maison améliorée")
                .setDescription(
                    `Votre maison est maintenant niveau **${family.houseLevel}**.`
                )
            ]
        });

    }

};
