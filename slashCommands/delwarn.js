const {
SlashCommandBuilder,
EmbedBuilder
} = require("discord.js");

const WARN1_ROLE = "1518890473727463485";
const WARN2_ROLE = "1518890512172453898";
const WARN3_ROLE = "1518890554652496013";

const STAFF_ROLES = [
"1506674274826584284",
"1506678694352261301",
"1506678765982318743",
"1506696551706267688",
"1507082580414173234",
"1506696757642530982",
"1509601528242110525",
"1506709088451690708"
];

module.exports = {
data: new SlashCommandBuilder()
.setName("delwarn")
.setDescription("Retire un niveau de warn à un membre")
.addUserOption(option =>
option
.setName("membre")
.setDescription("Membre concerné")
.setRequired(true)
),
  async execute(interaction) {

    const member =
        interaction.options.getMember("membre");

    if (!member) {
        return interaction.reply({
            content: "❌ Membre introuvable.",
            ephemeral: true
        });
    }

    const hasPermission =
        interaction.member.roles.cache.some(
            role => STAFF_ROLES.includes(role.id)
        );

    if (!hasPermission) {
        return interaction.reply({
            content: "❌ Vous n'avez pas la permission.",
            ephemeral: true
        });
    }

    let result;

    if (member.roles.cache.has(WARN3_ROLE)) {

        await member.roles.remove(WARN3_ROLE);
        await member.roles.add(WARN2_ROLE);

        result = "Warn 3 ➜ Warn 2";

    } else if (member.roles.cache.has(WARN2_ROLE)) {

        await member.roles.remove(WARN2_ROLE);
        await member.roles.add(WARN1_ROLE);

        result = "Warn 2 ➜ Warn 1";

    } else if (member.roles.cache.has(WARN1_ROLE)) {

        await member.roles.remove(WARN1_ROLE);

        result = "Warn 1 supprimé";

    } else {

        return interaction.reply({
            content: "❌ Ce membre n'a aucun warn.",
            ephemeral: true
        });
    }

    const embed =
        new EmbedBuilder()
            .setColor("Green")
            .setTitle("✅ Warn retiré")
            .setDescription(`${member}`)
            .addFields({
                name: "Résultat",
                value: result
            })
            .setTimestamp();

    await interaction.reply({
        embeds: [embed]
    });
}
  };
  
