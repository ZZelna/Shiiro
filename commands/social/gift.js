const {
    EmbedBuilder
} = require("discord.js");

const Marriage = require("../../models/Marriage");
const CasinoProfile = require("../../models/CasinoProfile");

module.exports = {

    name: "gift",

    async run(message, args) {

        const target = message.mentions.members.first();

        if (!target)
            return message.reply(
                "❌ Mentionnez votre partenaire."
            );

        const amount = Number(args[1]);

        if (!amount || amount <= 0)
            return message.reply(
                "❌ Montant invalide."
            );

        const marriage = await Marriage.findOne({
            guildId: message.guild.id,
            users: message.author.id
        });

        if (!marriage)
            return message.reply(
                "❌ Vous n'êtes pas marié."
            );

        if (!marriage.users.includes(target.id))
            return message.reply(
                "❌ Cette personne n'est pas votre partenaire."
            );

        const sender = await CasinoProfile.findOne({
            userId: message.author.id
        });

        const receiver = await CasinoProfile.findOne({
            userId: target.id
        });

        if (!sender || !receiver)
            return message.reply(
                "❌ Profil casino introuvable."
            );

        if ((sender.yens || 0) < amount)
            return message.reply(
                "❌ Vous n'avez pas assez de yens."
            );

        sender.yens -= amount;
        receiver.yens = (receiver.yens || 0) + amount;

        await sender.save();
        await receiver.save();

        marriage.gifts = (marriage.gifts || 0) + 1;
        marriage.giftValue = (marriage.giftValue || 0) + amount;
        marriage.love = (marriage.love || 0) + Math.floor(amount / 1000);

        await marriage.save();

        const embed = new EmbedBuilder()

            .setColor("#FFD166")

            .setTitle("🎁 Cadeau envoyé")

            .setDescription(
                `${message.author} offre **${amount.toLocaleString("fr-FR")} ¥** à ${target} ❤️`
            )

            .addFields(

                {
                    name: "🎁 Cadeaux",
                    value: `${marriage.gifts}`,
                    inline: true
                },

                {
                    name: "💴 Total offert",
                    value: `${marriage.giftValue.toLocaleString("fr-FR")} ¥`,
                    inline: true
                },

                {
                    name: "❤️ Love gagné",
                    value: `+${Math.floor(amount / 1000)}`,
                    inline: true
                },

                {
                    name: "💖 Love total",
                    value: `${marriage.love}`,
                    inline: true
                }

            )

            .setFooter({
                text: "Shiiro • Couple"
            })

            .setTimestamp();

        return message.reply({
            embeds: [embed]
        });

    }

};
