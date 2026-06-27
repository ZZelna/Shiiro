const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require("discord.js");

const CasinoProfile = require("../models/CasinoProfile");

const allowedRoles = ["1506709088451690708", "1506674274826584284"];

module.exports = {
  data: new SlashCommandBuilder()
    .setName("drop")
    .setDescription("Lance un drop."),

  async execute(interaction) {
    const hasRole = interaction.member.roles.cache.some(r => allowedRoles.includes(r.id));

    if (!hasRole) {
      return interaction.reply({
        content: "❌ Tu n'as pas la permission d'utiliser cette commande.",
        ephemeral: true
      });
    }

    const button = new ButtonBuilder()
      .setCustomId("claim_drop")
      .setLabel("🎉 Récupérer")
      .setStyle(ButtonStyle.Success);

    const row = new ActionRowBuilder().addComponents(button);

    const embed = new EmbedBuilder()
      .setColor("Gold")
      .setTitle("🎁 DROP")
      .setDescription("Le premier à cliquer sur **🎉 Récupérer** gagne une récompense !");

    const msg = await interaction.reply({
      embeds: [embed],
      components: [row],
      fetchReply: true
    });

    const collector = msg.createMessageComponentCollector({
      time: 60000
    });

    collector.on("collect", async (i) => {
      const user = await CasinoProfile.findOne({ userId: i.user.id });

      if (!user) {
        await i.reply({
          content: "❌ Tu n'as pas de profil casino. Utilise `/casino` pour en créer un.",
          ephemeral: true
        });
        return;
      }

      collector.stop("claimed");

      const rewards = [
        () => {
          const value = Math.floor(Math.random() * 4000) + 1000;
          user.yens += value;
          return `💴 **${value} Yens**`;
        },
        () => {
          user.gifts += 1;
          return "🎁 **1 Gift**";
        },
        () => {
          user.boostMultiplier = 2;
          user.boostEnd = new Date(Date.now() + 60 * 60 * 1000);
          return "💰 **1 Doubleur de Yens (1h)**";
        }
      ];

      const reward = rewards[Math.floor(Math.random() * rewards.length)]();

      await user.save();

      button.setDisabled(true);

      await i.update({
        embeds: [
          new EmbedBuilder()
            .setColor("Green")
            .setTitle("🎉 Drop récupéré")
            .setDescription(`${i.user} a remporté ${reward} !`)
        ],
