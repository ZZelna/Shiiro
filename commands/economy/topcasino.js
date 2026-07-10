const {
    EmbedBuilder
} = require("discord.js");

const CasinoProfile = require("../../models/CasinoProfile");

module.exports = {
    name: "topcasino",

    async run(message) {

        const ALLOWED_CHANNEL = "1519055718416781412";

        if (message.channel.id !== ALLOWED_CHANNEL) {
            return message.reply(
                "❌ Cette commande est uniquement utilisable dans <#1519055718416781412>."
            );
        }

        const users = await CasinoProfile.find()
            .sort({
                yens: -1
            })
            .limit(10);

        if (!users.length) {
            return message.reply(
                "❌ Aucun profil casino trouvé."
            );
        }

        const medals = [
            "🥇",
            "🥈",
            "🥉"
        ];

        const maxYens = users[0].yens;

        let description = "";

        for (let i = 0; i < users.length; i++) {

            const discordUser = await message.client.users
                .fetch(users[i].userId)
                .catch(() => null);

            const username = discordUser
                ? discordUser.username
                : "Utilisateur inconnu";

            const rank = medals[i] || `#${i + 1}`;

            const percent = users[i].yens / maxYens;

            const filled = Math.max(
                1,
                Math.round(percent * 10)
            );

            const bar =
                "🟩".repeat(filled) +
                "⬜".repeat(10 - filled);

            description +=
`${rank} **${username}**
${bar}
💴 **${users[i].yens.toLocaleString()} ¥**

`;
        }

        const embed = new EmbedBuilder()
            .setColor("Blue")
            .setTitle("🏆 Top Casino")
            .setDescription(description)
            .setTimestamp();

        return message.reply({
            embeds: [embed]
        });

    }
};
