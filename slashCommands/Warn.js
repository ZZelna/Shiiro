const {
SlashCommandBuilder,
EmbedBuilder
} = require("discord.js");

const WARN1_ROLE = "1518890473727463485”;
const WARN2_ROLE = "1518890512172453898";
const WARN3_ROLE = "1518890554652496013";
const BAN_ROLE = "1518890629310971944";

const JUDGE_ROLE = "1507082580414173234";

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
.setName("warn")
.setDescription("Warn un membre")
.addUserOption(option =>
option
.setName("membre")
.setDescription("Membre à warn")
.setRequired(true)
)
.addStringOption(option =>
option
.setName("motif")
.setDescription("Motif du warn")
.setRequired(true)
.addChoices(
{ name: "Spam", value: "spam" },
{ name: "Insultes", value: "insultes" },
{ name: "Messages offensants", value: "offensants" },
{ name: "Leak", value: "leak" },
{ name: "Dox", value: "dox" },
{ name: "Swatt", value: "swatt" },
{ name: "Menaces", value: "menaces" },
{ name: "NSFW", value: "nsfw" }
)
),
  async execute(interaction) {

    const member =
        interaction.options.getMember("membre");

    const motif =
        interaction.options.getString("motif");

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

    let level = 1;

    if (member.roles.cache.has(WARN3_ROLE)) {

        await member.roles.remove(WARN3_ROLE);
        await member.roles.add(BAN_ROLE);

        const embed =
            new EmbedBuilder()
                .setColor("DarkRed")
                .setTitle("🚨 4ème Warn")
                .setDescription(`${member} a atteint 4 warns.`)
                .addFields({
                    name: "Motif",
                    value: motif
                })
                .setTimestamp();

        return interaction.reply({
            content: `<@&${JUDGE_ROLE}> ${member} doit être banni.`,
            embeds: [embed]
        });

    } else if (member.roles.cache.has(WARN2_ROLE)) {

        await member.roles.remove(WARN2_ROLE);
        await member.roles.add(WARN3_ROLE);

        level = 3;

    } else if (member.roles.cache.has(WARN1_ROLE)) {

        await member.roles.remove(WARN1_ROLE);
        await member.roles.add(WARN2_ROLE);

        level = 2;

    } else {

        await member.roles.add(WARN1_ROLE);

        level = 1;
    }

    const embed =
        new EmbedBuilder()
            .setColor("Orange")
            .setTitle(`⚠️ Warn ${level}`)
            .setDescription(`${member} a reçu un avertissement.`)
            .addFields(
                {
                    name: "Motif",
                    value: motif
                },
                {
                    name: "Modérateur",
                    value: `${interaction.user}`
                }
            )
            .setTimestamp();

    await interaction.reply({
        embeds: [embed]
    });
}
  };
