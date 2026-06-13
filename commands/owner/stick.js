const fs = require("fs");
const config = require("../../config.json");

module.exports = {
    name: "stick",

    async run(message, args) {

        if (!config.owner_ids.includes(message.author.id)) {
            return message.reply("❌ Cette commande est réservée aux owners.");
        }

        const text = args.join(" ");

        if (!text) {
            return message.reply(
                "❌ Utilisation : +stick <message>"
            );
        }

        let stickies = {};

        if (fs.existsSync("./data/stickies.json")) {
            stickies = require("../../data/stickies.json");
        }

        stickies[message.channel.id] = {
            content: text,
            messageId: null
        };

        fs.writeFileSync(
            "./data/stickies.json",
            JSON.stringify(stickies, null, 2)
        );

        return message.reply(
            "✅ Sticky configuré."
        );
    }
};
