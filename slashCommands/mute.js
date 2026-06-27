const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

const MUTE_ROLE = "1508842233619677306"; // ← remplace par l'ID du rôle mute

const allowedRoles = [
   "1506698593199718644",
   "1509601528242110525",
   "1506674274826584284",
   "1506696551706267688",
   "1506678765982318743",
   "1506678694352261301",
   "1506696757642530982",
   "1506702398029172796",
   "1517238655444451520",
   "1506709088451690708",
   "1507052310151434300",
   "1507802146521878678",
   "1507084485663916032",
   "1507082580414173234",
   "1509228874179809512",
   "1508500076635623546",
   "1509967284754583683"
];

module.exports = {
    data: new SlashCommandBuilder()
        .setName("mute")
        .setDescription("Mute un membre")
        .addUserOption(option =>
            option.setName("membre").setDescription("Membre à mute").setRequired(true)
        )
        .addIntegerOption(option =>
            option.setName("minutes").setDescription("Durée en minutes").setRequired(true)
        )
        .addStringOption(option =>
            option.setName("raison").setDescription("Raison du mute").setRequired(true)
        ),

    async execute(interaction) {

        const hasPermission = interaction.member.roles.cache.some(role =>
            allowedRoles.includes(role.id)
        );

        if (!hasPermission) {
            return interaction.reply({
                content: "❌ Vous n'avez pas la permission.",
                ephemeral: true
            });
        }

        const member = interaction.options.getMember("membre");
        const minutes = interaction.options.getInteger("minutes");
        const raison = interaction.options.getString("raison");

        if (!member) {
            return interaction.reply({ content: "❌ Membre introuvable.", ephemeral: true });
        }

        try {

            await member.timeout(minutes * 60 * 1000, raison);

            if (member.voice.channel) {
                await member.voice.disconnect("Mute").catch(() => {});
            }

            const logChannel = interaction.client.channels.cache.get("1520445447263486236");
            if (logChannel) {
                await logChannel.send({
                    content:
`\`\`\`diff
- Mute effectué.
Utilisateur: ${member.user.tag} (ID: ${member.id})
Modérateur: ${interaction.user.tag} (ID: ${interaction.user.id})
Raison: ${raison}
Durée: ${minutes} minute(s)
Action: Mute. 🔇
\`\`\``
                });
            }

            const embed = new EmbedBuilder()
                .setColor("Orange")
                .setTitle("🔇 Mute")
                .setDescription(`${member} a été mute`)
                .addFields(
                    { name: "📌 Raison", value: raison },
                    { name: "⏳ Durée", value: `${minutes} minute(s)` }
                )
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });

        } catch (err) {
            console.error(err);
            return interaction.reply({ content: "❌ Impossible de mute ce membre.", ephemeral: true });
        }
    }
};
