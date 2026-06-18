const flags = require("./data/flags.json");

client.on("messageCreate", async (message) => {
    if (message.author.bot) return;

    if (message.content === ".guessflags") {

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
});
