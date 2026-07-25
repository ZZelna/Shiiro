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
                "Améliorez votre famille grâce aux différentes améliorations disponibles."
            )

            .addFields(

                {
                    name: "🏠 Agrandissement de la maison",
                    value:
                        "💴 **250 000 ¥**\nPasse au niveau supérieur de maison.",
                    inline: false
                },

                {
                    name: "👶 Emplacement d'enfant",
                    value:
                        "💴 **500 000 ¥**\nDébloque **+1 enfant** (maximum +10).",
                    inline: false
                },

                {
                    name: "💰 Revenus familiaux",
                    value:
                        "💴 **1 000 000 ¥**\nAugmente les revenus familiaux de **5 %**.",
                    inline: false
                },

                {
                    name: "🎖️ Badge de famille",
                    value:
                        "💴 **2 500 000 ¥**\nDébloque un badge exclusif pour votre famille.",
                    inline: false
                },

                {
                    name: "🏰 Villa",
                    value:
                        "💴 **5 000 000 ¥**\nTransforme votre maison en **Villa**.",
                    inline: false
                },

                {
                    name: "👑 Château",
                    value:
                        "💴 **15 000 000 ¥**\nDébloque le prestigieux **Château** familial.",
                    inline: false
                }

            )

            .setFooter({
                text: "Utilisez *buyfamily <objet> pour effectuer un achat."
            })

            .setTimestamp();

        return message.reply({
            embeds: [embed]
        });

    }

};
