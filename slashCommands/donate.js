const {
   SlashCommandBuilder,
   EmbedBuilder
} = require("discord.js");

const CasinoProfile = require("../models/CasinoProfile");

const LOGS_CASINO = "1520766436388245585";

module.exports = {
   data: new SlashCommandBuilder()
       .setName("donate")
       .setDescription("Donner des Yens à un joueur")
       .addUserOption(option =>
           option
               .setName("joueur")
               .setDescription("Joueur à qui donner")
               .setRequired(true)
       )
       .addIntegerOption(option =>
           option
               .setName("montant")
               .setDescription("Montant à donner")
               .setRequired(true)
               .setMinValue(1)
       ),

   async execute(interaction) {
   const ALLOWED_CHANNEL = "1523677940750225508";

    if (interaction.channelId !== ALLOWED_CHANNEL) {

        return interaction.reply({

            content: "❌ Cette commande est uniquement utilisable dans <#1523677940750225508>.",

            ephemeral: true

        });

    }

    const target = interaction.options.getUser("joueur");

    const amount = interaction.options.getInteger("montant");

       if (target.id === interaction.user.id) {
           return interaction.reply({
               content: "❌ Tu ne peux pas te donner des Yens à toi-même.",
               ephemeral: true
           });
       }

       const sender = await CasinoProfile.findOne({ userId: interaction.user.id });

       if (!sender) {
           return interaction.reply({
               content: "❌ Tu n'as pas de profil casino.",
               ephemeral: true
           });
       }

       const receiver = await CasinoProfile.findOne({ userId: target.id });

       if (!receiver) {
           return interaction.reply({
               content: "❌ Ce joueur n'a pas de profil casino.",
               ephemeral: true
           });
       }

       if (sender.yens < amount) {
           return interaction.reply({
               content: "❌ Tu ne possèdes pas assez de Yens.",
               ephemeral: true
           });
       }

       sender.yens -= amount;
       receiver.yens += amount;

       await sender.save();
       await receiver.save();

       const embed = new EmbedBuilder()
           .setColor("Green")
           .setTitle("💴 Donation effectuée")
           .setDescription(
               `${interaction.user} a envoyé **${amount.toLocaleString()} ¥** à ${target}.`
           )
           .setTimestamp();

       await interaction.reply({ embeds: [embed] });

       try {
           const logsGuild = interaction.client.guilds.cache.find(g =>
               g.channels.cache.has(LOGS_CASINO)
           );
           const logsChannel = logsGuild?.channels.cache.get(LOGS_CASINO);
           if (logsChannel) {
               await logsChannel.send({
                   content: `\`\`\`- Donation effectuée.\nExpéditeur: ${interaction.user.username} (ID: ${interaction.user.id})\nDestinataire: ${target.username} (ID: ${target.id})\nMontant: ${amount.toLocaleString()} ¥\nAction: Yens transférés. 💴\`\`\``
               });
           }
       } catch {}
   }
};
