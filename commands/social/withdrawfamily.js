const {
    EmbedBuilder
} = require("discord.js");

const Marriage = require("../../models/Marriage");
const Family = require("../../models/Family");
const CasinoProfile = require("../../models/CasinoProfile");

module.exports = {

    name: "withdrawfamily",

    async run(message, args) {

        const amount = parseInt(args[0]);

        if (!amount || amount <= 0)
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

        if (family.coins < amount)
            return message.reply("❌ Fonds insuffisants.");

        const profile = await CasinoProfile.findOne({
            userId: message.author.id
        });

        if (!profile)
            return message.reply("❌ Profil casino introuvable.");

        family.coins -= amount;
        profile.coins += amount;

        await family.save();
        await profile.save();

        const embed = new EmbedBuilder()
            .setColor("#F39C12")
            .setTitle("💸 Retrait familial")
            .setDescription(
                `${message.author} retire **${amount.toLocaleString("fr-FR")} ¥** de la banque familiale.`
            )
            .addFields(
                {
                    name: "🏦 Banque restante",
                    value: `${family.coins.toLocaleString("fr-FR")} ¥`
                }
            )
            .setTimestamp();

        return message.reply({
            embeds: [embed]
        });

    }

};
