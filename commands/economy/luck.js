const {
    EmbedBuilder
} = require("discord.js");

const { checkCasinoChannel } = require("../../utils/guards/casinoChannelGuard");

module.exports = {

    name: "luck",

    async run(message) {

        if (!(await checkCasinoChannel(message))) return;

        const embed =
            new EmbedBuilder()
                .setColor("Gold")
                .setTitle("🍀 Chances des Gifts")
                .setDescription(
                    "Voici les probabilités actuelles des récompenses."
                )
                .addFields(
                    {
                        name: "🎁 Récompenses Permanentes",
                        value:
                            "🔊 Perm VOC Chat → **20%**\n" +
                            "🖼️ Perm Pic → **15%**\n" +
                            "🎨 Perm Banner → **15%**\n" +
                            "✨ Perm Animation → **10%**\n" +
                            "✏️ Perm Rename → **10%**",
                        inline: false
                    },
                    {
                        name: "💴 Récompenses Casino",
                        value:
                            "50 000 ¥ → **15%**\n" +
                            "100 000 ¥ → **8%**\n" +
                            "250 000 ¥ → **4%**\n" +
                            "500 000 ¥ → **2%**\n" +
                            "1 000 000 ¥ → **1%**",
                        inline: false
                    }
                )
                .setFooter({
                    text: "Les récompenses permanentes déjà possédées peuvent être remplacées."
                })
                .setTimestamp();

        return message.reply({
            embeds: [embed]
        });

    }

};
