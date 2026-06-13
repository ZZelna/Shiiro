const config = require("../../config.json");

module.exports = {
    name: "say",

    async run(message, args) {

        if (!config.owner_ids.includes(message.author.id)) {
            return message.reply("❌ Cette commande est réservée aux owners.");
        }

        if (!args.length) {
            return message.reply(
                "❌ Utilisation : +say [#salon] <message>"
            );
        }

        let channel = message.channel;
        let text = args.join(" ");

        const mentionedChannel = message.mentions.channels.first();

        if (mentionedChannel) {
            channel = mentionedChannel;
            text = args.slice(1).join(" ");
        }

        if (!text) {
            return message.reply(
                "❌ Tu dois fournir un message."
            );
        }

        await channel.send(text);

        return message.reply(
            ✅ Message envoyé dans ${channel}.
        );
    }
};
