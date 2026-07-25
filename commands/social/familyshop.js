const {
    EmbedBuilder
} = require("discord.js");

module.exports = {

    name: "familyshop",

    async run(message) {

        const embed = new EmbedBuilder()

            .setColor("#5865F2")

            .setTitle("🏪 Boutique Familiale")

            .setDescription(
`Bienvenue dans la boutique de votre famille !

🛏️ **Maison plus grande** — 250 000 ¥

👶 **+1 enfant maximum** — 500 000 ¥

💰 **+5 % revenus familiaux** — 1 000 000 ¥

🎖️ **Badge Famille** — 2 500 000 ¥

🏰 **Villa** — 5 000 000 ¥

👑 **Château** — 15 000 000 ¥`
            );

        message.reply({
            embeds: [embed]
        });

    }

};
