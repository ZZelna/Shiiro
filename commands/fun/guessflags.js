const flags = require("../../data/flags.json");

module.exports = {
    name: "guessflags",

    run: async (message, args, options = {}) => {

    if (!message.member && !options.auto) return;

    if (!options.auto) {
        const roleAllowed = "1506674274826584284";
        if (!message.member.roles.cache.has(roleAllowed)) {
            return message.reply("❌ Tu n'as pas la permission d'utiliser ce mini-jeu.");
        }
    }
    // reste inchangé...


        const random =
            flags[Math.floor(Math.random() * flags.length)];

        const embed = {
            title: "🌍 Guess The Flag",
            description: "Quel pays correspond à ce drapeau ?",
            image: {
                url: `https://raw.githubusercontent.com/ZZelna/Shiiro/main/assets/flags/${random.image}`
            },
            color: 0x3498db
        };

        await message.channel.send({
            embeds: [embed]
        });

        const filter = m =>
            !m.author.bot &&
            m.channel.id === message.channel.id;

        const collector =
            message.channel.createMessageCollector({
                filter,
                time: 15000
            });

        collector.on("collect", m => {

            if (
                m.content.toLowerCase().trim() ===
                random.country.toLowerCase().trim()
            ) {

                collector.stop("win");

                m.reply("✅ Bonne réponse !");
            }
        });

        collector.on("end", (_, reason) => {

            if (reason !== "win") {

                message.channel.send(
                    `⏰ Temps écoulé ! La réponse était **${random.country}**.`
                );
            }
        });
    }
};
