const {
    EmbedBuilder,
    ActionRowBuilder,
    StringSelectMenuBuilder
} = require("discord.js");

const config = require("../message.json");

module.exports = {
    name: "ticketpanel",

    async run(message) {

        // Facultatif : limiter la commande aux admins
        if (!message.member.permissions.has("Administrator")) {
            return message.reply("❌ Tu n'as pas la permission.");
        }

        const embed = new EmbedBuilder()
            .setColor(config.embedColor)
            .setTitle(config.messages.panelTitle)
            .setDescription(config.messages.panelBody);

        const menu = new StringSelectMenuBuilder()
            .setCustomId("ticket_category")
            .setPlaceholder("Choisissez une catégorie");

        config.categories.forEach(cat => {
            menu.addOptions({
                label: cat.label,
                description: cat.description,
                value: cat.id,
                emoji: cat.emoji
            });
        });

        const row = new ActionRowBuilder().addComponents(menu);

        await message.channel.send({
            embeds: [embed],
            components: [row]
        });

        await message.delete().catch(() => {});
    }
};
