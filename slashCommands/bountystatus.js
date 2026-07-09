const {
   SlashCommandBuilder,
   EmbedBuilder
} = require("discord.js");

const Bounty = require("../models/Bounty");

module.exports = {
   data: new SlashCommandBuilder()
       .setName("bountystatus")
       .setDescription("Affiche la liste des primes actives."),

   async execute(interaction) {
     const ALLOWED_CHANNEL = "1519247019246616598";

    if (interaction.channelId !== ALLOWED_CHANNEL) {

        return interaction.reply({

            content: "❌ Cette commande est uniquement utilisable dans <#1523677940750225508>.",

            ephemeral: true

        });

    }

    const bounties = await Bounty.find();

    if (!bounties.length) {

        return interaction.reply({

            content: "✅ Aucune prime active en ce moment.",

            ephemeral: true

        });

    }
 const embed = new EmbedBuilder()
           .setColor("DarkRed")
           .setTitle("🎯 Primes Actives")
           .setDescription(`**${bounties.length}** prime(s) en cours.`)
           .setFooter({ text: "Shiiro Casino • Bounty", iconURL: interaction.guild.iconURL() })
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

       await interaction.reply({ embeds: [embed], ephemeral: false });
   }
};
