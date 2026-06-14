const {
    EmbedBuilder
} = require("discord.js");

module.exports = {
    name: "snipe",

    async run(message, args) {

        const snipes =
            message.client.snipes.get(
                message.channel.id
            );

        if (!snipes || snipes.length === 0) {
            return message.reply(
                "❌ Aucun message supprimé."
            );
        }

        const index =
            parseInt(args[0]) - 1 || 0;

        if (!snipes[index]) {
            return message.reply(
                "❌ Ce snipe n'existe pas."
            );
        }

        const snipe = snipes[index];

        const embed =
            new EmbedBuilder()
                .setColor("#5865F2")
                .setTitle(
                    `🗑️ Snipe #${index + 1}`
                )
                .addFields(
                    {
                        name: "👤 Auteur",
                        value: snipe.author,
                        inline: false
                    },
                    {
                        name: "💬 Message",
                        value:
                            snipe.content
                                .substring(
                                    0,
                                    1024
                                ),
                        inline: false
                    }
                )
                .setFooter({
                    text:
                        `Demandé par ${message.author.tag}`
                })
                .setTimestamp();

        if (snipe.image) {
            embed.setImage(
                snipe.image
            );
        }

        return message.channel.send({
            embeds: [embed]
        });
    }
};
