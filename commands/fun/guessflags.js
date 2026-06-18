client.on("messageCreate", async (message) => {
    if (message.content === ".guessflags") {

        const flags = require("./data/flags.json");
        const random = flags[Math.floor(Math.random() * flags.length)];

        const embed = {
            title: "🌍 Guess The Flag",
            description: "Quel pays correspond à ce drapeau ?",
            image: {
                url: `https://monsite.com/flags/${random.image}`
            },
            color: 0x3498db
        };

        await message.channel.send({ embeds: [embed] });

        const filter = m => !m.author.bot;
        const collector = message.channel.createMessageCollector({
            filter,
            time: 15000,
            max: 1
        });

        collector.on("collect", m => {
            if (m.content.toLowerCase() === random.country.toLowerCase()) {
                m.reply("✅ Bonne réponse !");
            } else {
                m.reply(`❌ Mauvaise réponse ! La réponse était **${random.country}**.`);
            }
        });
    }
});
