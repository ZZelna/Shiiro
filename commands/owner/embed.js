const config = require("../../config.json");
const { EmbedBuilder } = require("discord.js");

module.exports = {
    name: "embed",

    async run(message, args) {

        if (!config.owner_ids.includes(message.author.id)) {
            return message.reply("❌ Cette commande est réservée aux owners.");
        }

        const channel = message.mentions.channels.first();

        if (!channel) {
            return message.reply(
                "❌ Utilisation : +embed #salon Titre | Description"
            );
        }

        const content = args.slice(1).join(" ");

        if (!content.includes("|")) {
            return message.reply(
                "❌ Utilisation : +embed #salon Titre | Description"
            );
        }

        const [title, description] = content
            .split("|")
            .map(text => text.trim());

        const embed = new EmbedBuilder()
            .setColor("#5865F2")
            .setTitle(title)
            .setDescription(description)
            .setTimestamp();

        await channel.send({
            embeds: [embed]
        });

           return message.reply(

            `✅ Embed envoyé dans ${channel}.`

        );

    }

}
