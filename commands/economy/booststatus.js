const {
    EmbedBuilder
} = require("discord.js");

const CasinoProfile = require("../../models/CasinoProfile");

module.exports = {
    name: "booststatus",

    async run(message) {

        const user = await CasinoProfile.findOne({
            userId: message.author.id
        });

        if (!user) {
            return message.reply(
                "❌ Tu n'as pas de profil casino. Utilise **/casino** pour en créer un."
            );
        }

        const now = Date.now();
        const boostActive =
            user.boostEnd &&
            new Date(user.boostEnd).getTime() > now;

        if (!boostActive) {
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor("Grey")
                        .setTitle("🚀 Statut du boost")
                        .setDescription(
                            "Tu n'as pas de boost actif en ce moment."
                        )
                ]
            });
        }

        const remaining =
            new Date(user.boostEnd).getTime() - now;

        const minutes = Math.floor(remaining / 60000);
        const seconds = Math.floor((remaining % 60000) / 1000);

        return message.reply({
            embeds: [
                new EmbedBuilder()
                    .setColor("Gold")
                    .setTitle("🚀 Statut du boost")
                    .setDescription(
                        `🔮 Boost actif : **x${user.boostMultiplier}**\n` +
                        `⏳ Temps restant : **${minutes}m ${seconds}s**`
                    )
            ]
        });

    }
};
