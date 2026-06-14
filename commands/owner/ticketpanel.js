const config = require('../../../config.json');
const {
EmbedBuilder,
ActionRowBuilder,
StringSelectMenuBuilder
} = require("discord.js");

module.exports = {
name: "ticketpanel",

async run(message) {
    if (!config.owner_ids.includes(message.author.id)) {
        return message.reply("❌ Cette commande est réservée aux owners.");
    }
    const embed = new EmbedBuilder()
        .setColor("#2B2D31")
        .setTitle("🎫 Support Shiiro")
        .setDescription(

`Bienvenue sur le support de Shiiro.

Veuillez sélectionner la catégorie correspondant à votre demande afin qu’un membre de l’équipe puisse vous aider.`
);

    const menu = new StringSelectMenuBuilder()
        .setCustomId("ticket_create")
        .setPlaceholder("Choisissez une catégorie")
        .addOptions([
            {
                label: "Administration",
                description: "Contacter l'administration",
                value: "admin",
                emoji: "👑"
            },
            {
                label: "Gestion Abus",
                description: "Signaler un abus",
                value: "abus",
                emoji: "⚠️"
            },
            {
                label: "Gestion Staff",
                description: "Contacter le staff",
                value: "staff",
                emoji: "📎"
            },
            {
                label: "Gestion Casino",
                description: "Support casino",
                value: "casino",
                emoji: "💰"
            },
            {
                label: "Partenariat",
                description: "Demande de partenariat",
                value: "partenariat",
                emoji: "🤝"
            }
        ]);
    const row = new ActionRowBuilder()
        .addComponents(menu);
    await message.channel.send({
        embeds: [embed],
        components: [row]
    });
    return message.reply("✅ Panel ticket envoyé.");
}

};
