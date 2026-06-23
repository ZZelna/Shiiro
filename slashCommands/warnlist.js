const {
SlashCommandBuilder,
EmbedBuilder
} = require("discord.js");

const WARN1_ROLE = "1518890473727463485";
const WARN2_ROLE = "1518890512172453898";
const WARN3_ROLE = "1518890554652496013";
const BAN_ROLE = "1518890629310971944";

module.exports = {
data: new SlashCommandBuilder()
.setName("warnlist")
.setDescription("Affiche tous les membres warn"),
  async execute(interaction) {

    const guild = interaction.guild;

    const warn1 =
        guild.roles.cache
            .get(WARN1_ROLE)
            ?.members.map(m => `${m.user.tag}`)
            .join("\n") || "Aucun";

    const warn2 =
        guild.roles.cache
            .get(WARN2_ROLE)
            ?.members.map(m => `${m.user.tag}`)
            .join("\n") || "Aucun";

    const warn3 =
        guild.roles.cache
            .get(WARN3_ROLE)
            ?.members.map(m => `${m.user.tag}`)
            .join("\n") || "Aucun";

    const ban =
        guild.roles.cache
            .get(BAN_ROLE)
            ?.members.map(m => `${m.user.tag}`)
            .join("\n") || "Aucun";

    const embed =
        new EmbedBuilder()
            .setColor("Orange")
            .setTitle("📋 Liste des Warns")
            .addFields(
                {
                    name: "⚠️ Warn 1",
                    value: warn1.slice(0, 1024)
                },
                {
                    name: "⚠️ Warn 2",
                    value: warn2.slice(0, 1024)
                },
                {
                    name: "⚠️ Warn 3",
                    value: warn3.slice(0, 1024)
                },
                {
                    name: "🚨 BAN",
                    value: ban.slice(0, 1024)
                }
            )
            .setTimestamp();

    await interaction.reply({
        embeds: [embed]
    });
}
  };
