const {
    EmbedBuilder
} = require("discord.js");

const CasinoProfile = require("../../models/CasinoProfile");

module.exports = {
    name: "casino",

    async run(message) {

        const ALLOWED_CHANNEL = "1519055718416781412";

        if (message.channel.id !== ALLOWED_CHANNEL) {
            return message.reply(
                "❌ Cette commande est uniquement utilisable dans <#1519055718416781412>."
            );
        }

        const profile = await CasinoProfile.findOne({
            userId: message.author.id
        });

        if (!profile) {
            return message.reply(
                "❌ Tu n'as pas encore créé ton profil casino."
            );
        }

        const embed = new EmbedBuilder()
            .setColor("#00BFFF")
            .setAuthor({
                name: `${message.author.username} • Profil Casino`,
                iconURL: message.author.displayAvatarURL()
            })
            .setThumbnail(
                message.author.displayAvatarURL()
            )
            .addFields(
                {
                    name: "💴 Yens",
                    value: `${profile.yens.toLocaleString()} ¥`,
                    inline: true
                },
                {
                    name: "🎁 Gifts",
                    value: `${profile.gifts.toLocaleString()}`,
                    inline: true
                }
            )
            .setFooter({
                text: "Shiiro Casino"
            })
            .setTimestamp();

        return message.reply({
            embeds: [embed]
        });

    }
};
