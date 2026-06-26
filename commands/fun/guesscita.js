const {
    EmbedBuilder
} = require("discord.js");

const quotes =
require("../../data/quotes.json");

module.exports = {

    name: "guesscita",

 run: async (message, args, options = {}) => {

    if (!message.member && !options.auto) return;

    if (!options.auto) {
        const roleAllowed = "1506674274826584284";
        if (!message.member.roles.cache.has(roleAllowed)) {
            return message.reply("❌ Tu n'as pas la permission d'utiliser ce mini-jeu.");
        }
    }
    // reste inchangé...

        const question =
            quotes[
                Math.floor(
                    Math.random() *
                    quotes.length
                )
            ];

        const embed =
            new EmbedBuilder()

            .setColor("#5865F2")

            .setTitle(
                "📖 Guess Philosophe"
            )

            .setDescription(
`> "${question.quote}"

⏱️ Vous avez 30 secondes pour répondre !`
            )

            .setTimestamp();

        await message.channel.send({
            embeds: [embed]
        });

        const collector =
            message.channel.createMessageCollector({
                filter: m =>
                    !m.author.bot,
                time: 30000
            });

        collector.on(
            "collect",
            async m => {

                if (
                    m.content.toLowerCase() ===
                    question.author.toLowerCase()
                ) {

                    const win =
                        new EmbedBuilder()

                        .setColor(
                            "#57F287"
                        )

                        .setTitle(
                            "✅ Bonne réponse !"
                        )

                        .setDescription(
`${m.author} a trouvé !

👤 Philosophe :
**${question.author}**`
                        );

                    await message.channel.send({
                        embeds: [win]
                    });

                    collector.stop();

                }

            }
        );

        collector.on(
            "end",
            async (_, reason) => {

                if (
                    reason ===
                    "time"
                ) {

                    const lose =
                        new EmbedBuilder()

                        .setColor(
                            "#ED4245"
                        )

                        .setTitle(
                            "⏰ Temps écoulé"
                        )

                        .setDescription(
`Personne n'a trouvé.

👤 Réponse :
**${question.author}**`
                        );

                    await message.channel.send({
                        embeds: [lose]
                    });

                }

            }
        );

    }

};
