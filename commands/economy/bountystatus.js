const {
    EmbedBuilder
} = require("discord.js");

const Bounty = require("../../models/Bounty");

module.exports = {
    name: "bountystatus",

    async run(message) {

        const ALLOWED_CHANNEL = "1519247019246616598";

        if (message.channel.id !== ALLOWED_CHANNEL) {
            return message.reply(
                "❌ Cette commande est uniquement utilisable dans <#1519247019246616598>."
            );
        }

        const bounties = await Bounty.find();

        if (!bounties.length) {
            return message.reply(
                "✅ Aucune prime active en ce moment."
            );
        }

        const embed = new EmbedBuilder()
            .setColor("DarkRed")
            .setTitle("🎯 Primes Actives")
            .setDescription(`**${bounties.length}** prime(s) en cours.`)
            .setFooter({
                text: "Shiiro Casino • Bounty",
                iconURL: message.guild.iconURL()
            })
            .setTimestamp();

        for (const bounty of bounties) {

            embed.addFields({
                name: `🎯 Cible : <@${bounty.targetId}>`,
                value:
                    `💴 **Récompense :** \`${bounty.amount.toLocaleString()} ¥\`\n` +
                    `📌 **Posée par :** <@${bounty.posterId}>\n` +
                    `🕐 **Posée le :** <t:${Math.floor(bounty.createdAt / 1000)}:R>`,
                inline: false
            });

        }

        return message.reply({
            embeds: [embed]
        });

    }
};
