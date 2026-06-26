const { EmbedBuilder } = require("discord.js");

const countries =
require("../../data/countries.json");

module.exports = {

    name: "guesscountry",

  run: async (message, args, options = {}) => {

    if (!message.member && !options.auto) return;

    if (!options.auto) {
        const roleAllowed = "1506674274826584284";
        if (!message.member.roles.cache.has(roleAllowed)) {
            return message.reply("❌ Tu n'as pas la permission d'utiliser ce mini-jeu.");
        }
    }
    // reste inchangé...


        const difficulties = [
            "easy",
            "medium",
            "hard",
            "extreme"
        ];

        const difficulty =
            difficulties.includes(
                args?.[0]?.toLowerCase()
            )
                ? args[0].toLowerCase()
                : "medium";

        const question =
            countries[
                Math.floor(
                    Math.random() *
                    countries.length
                )
            ];

        if (
            !question ||
            !question[difficulty]
        ) {

            return message.reply(
                "❌ Impossible de charger une question."
            );

        }

        const embed =
            new EmbedBuilder()

            .setColor("#5865F2")

            .setTitle(
                "🌍 Guess Country"
            )

            .addFields({
                name:
                    "📊 Difficulté",
                value:
                    difficulty.toUpperCase(),
                inline: true
            })

            .setDescription(
`📖 Indice :

${question[difficulty]}

⏱️ Vous avez 30 secondes !`
            );

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
                    m.content
                        .toLowerCase()
                        .trim() ===
                    question.country
                        .toLowerCase()
                ) {

                    collector.stop(
                        "found"
                    );

                    await message.channel.send({
                        embeds: [
                            new EmbedBuilder()

                            .setColor(
                                "#57F287"
                            )

                            .setTitle(
                                "✅ Bonne réponse"
                            )

                            .setDescription(
`${m.author} a trouvé !

🌍 Pays :
**${question.country}**

📊 Difficulté :
**${difficulty.toUpperCase()}**`
                            )
                        ]
                    });

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

                    await message.channel.send({
                        embeds: [
                            new EmbedBuilder()

                            .setColor(
                                "#ED4245"
                            )

                            .setTitle(
                                "⏰ Temps écoulé"
                            )

                            .setDescription(
`🌍 Réponse :

**${question.country}**

📊 Difficulté :
**${difficulty.toUpperCase()}**`
                            )
                        ]
                    });

                }

            }
        );

    }

};
