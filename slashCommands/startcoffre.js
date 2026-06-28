const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const Coffre = require("../models/Coffre");

const allowedRoles = ["1506709088451690708", "1506674274826584284"];

module.exports = {
  data: new SlashCommandBuilder()
    .setName("startcoffre")
    .setDescription("Lance un nouveau coffre à détruire."),

  async execute(interaction) {
    const hasRole = interaction.member.roles.cache.some(r => allowedRoles.includes(r.id));

    if (!hasRole) {
      return interaction.reply({
        content: "❌ Tu n'as pas la permission d'utiliser cette commande.",
        ephemeral: true
      });
    }

    await Coffre.deleteMany({});
    await Coffre.create({ totalHits: 0, destroyed: false, participants: {} });

    return interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor("Gold")
          .setTitle("🏦 Nouveau coffre !")
          .setDescription(
            `Un coffre contenant **5 000 000 Yens** vient d'apparaître !\n\n` +
            `Utilisez \`/attack\` toutes les 30 minutes pour le frapper.\n` +
            `Il faut **10 000 frappes** pour le détruire et partager le butin !`
          )
      ]
    });
  }
};
