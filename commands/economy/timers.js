const {
    EmbedBuilder
} = require("discord.js");

const CasinoProfile = require("../../models/CasinoProfile");

module.exports = {
    name: "timers",

    async run(message) {

        const ALLOWED_CHANNEL = "1523677940750225508";

        if (message.channel.id !== ALLOWED_CHANNEL) {
            return message.reply(
                "❌ Cette commande est uniquement utilisable dans <#1523677940750225508>."
            );
        }

        const profile = await CasinoProfile.findOne({
            userId: message.author.id
        });

        if (!profile) {
            return message.reply(
                "❌ Tu n'as pas encore de profil casino."
            );
        }

        const now = Date.now();

        const dailyCooldown = 24 * 60 * 60 * 1000;
        const claimCooldown = 20 * 60 * 1000;

        const availableEmoji = "<:casino:1507449720673669261>";

        let dailyText = `${availableEmoji} Disponible`;
        let claimText = `${availableEmoji} Disponible`;

        if (profile.lastDaily) {

            const remaining =
                dailyCooldown -
                (now - new Date(profile.lastDaily).getTime());

            if (remaining > 0) {

                const next = Math.floor(
                    (new Date(profile.lastDaily).getTime() + dailyCooldown) / 1000
                );

                dailyText = `<t:${next}:R>`;
            }
        }

        if (profile.lastClaim) {

            const remaining =
                claimCooldown -
                (now - profile.lastClaim);

            if (remaining > 0) {

                const next = Math.floor(
                    (profile.lastClaim + claimCooldown) / 1000
                );

                claimText = `<t:${next}:R>`;
            }
        }

        const embed = new EmbedBuilder()
            .setColor("#00BFFF")
            .setTitle("⏳ Timers Casino")
            .addFields(
                {
                    name: "🎁 Daily",
                    value: dailyText,
                    inline: true
                },
                {
                    name: "💰 Claim",
                    value: claimText,
                    inline: true
                }
            )
            .setFooter({
                text: message.author.username,
                iconURL: message.author.displayAvatarURL()
            })
            .setTimestamp();

        return message.reply({
            embeds: [embed]
        });

    }
};
