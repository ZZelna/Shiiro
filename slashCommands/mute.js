const { SlashCommandBuilder } = require("discord.js");

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
    "1521596407968960613",
    "1509967284754583683"
];

const REASONS = {
    spam: { duration: 5, label: "Spam" },
    insultes: { duration: 5, label: "Insultes" },
    insultes_recidive: { duration: 10, label: "Insultes (récidive)" },
    offensants: { duration: 10, label: "Messages offensants" },
    leak: { duration: 60, label: "Leak (ATT BAN)" },
    dox: { duration: 60, label: "Dox (ATT BAN)" },
    swatt: { duration: 60, label: "Swatt (ATT BAN)" },
    menaces: { duration: 60, label: "Menaces (ATT BAN)" },
    nsfw: { duration: 60, label: "NSFW (ATT BAN)" }
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName("mute")
        .setDescription("Mute un membre")
        .addUserOption(option =>
            option.setName("membre").setDescription("Membre à mute").setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName("motif")
                .setDescription("Motif du mute")
                .setRequired(true)
                .addChoices(
                    { name: "Spam (5 min)", value: "spam" },
                    { name: "Insultes (5 min)", value: "insultes" },
                    { name: "Insultes récidive (10 min)", value: "insultes_recidive" },
                    { name: "Messages offensants (10 min)", value: "offensants" },
                    { name: "Leak (60 min)", value: "leak" },
                    { name: "Dox (60 min)", value: "dox" },
                    { name: "Swatt (60 min)", value: "swatt" },
                    { name: "Menaces (60 min)", value: "menaces" },
                    { name: "NSFW (60 min)", value: "nsfw" },
                    { name: "Personnalisé", value: "custom" }
                )
        )
        .addIntegerOption(option =>
            option
                .setName("minutes")
                .setDescription("Durée personnalisée (uniquement si motif = Personnalisé)")
                .setRequired(false)
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
        const motif = interaction.options.getString("motif");
        const customMinutes = interaction.options.getInteger("minutes");

        if (!member) {
            return interaction.reply({ content: "❌ Membre introuvable.", ephemeral: true });
        }

        if (member.id === interaction.user.id) {
            return interaction.reply({
                content: "❌ Vous ne pouvez pas vous mute vous-même.",
                ephemeral: true
            });
        }

        if (member.roles.highest.position >= interaction.member.roles.highest.position) {
            return interaction.reply({
                content: "❌ Vous ne pouvez pas mute un membre avec un rôle supérieur ou égal.",
                ephemeral: true
            });
        }

        let duration;
        let reason;

        if (motif === "custom") {
            if (!customMinutes || customMinutes <= 0) {
                return interaction.reply({
                    content: "❌ Vous devez préciser une durée en minutes.",
                    ephemeral: true
                });
            }
            duration = customMinutes;
            reason = `Personnalisé (${customMinutes} min)`;
        } else {
            duration = REASONS[motif].duration;
            reason = REASONS[motif].label;
        }

        try {

            await member.timeout(duration * 60 * 1000, reason);

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
Motif: ${reason}
Durée: ${duration} minute(s)
Action: Mute. 🔇
\`\`\``
                });
            }

            await interaction.reply({
    content:
`\`\`\`diff
- Mute effectué.
Utilisateur: ${member.user.tag} (ID: ${member.id})
Modérateur: ${interaction.user.tag} (ID: ${interaction.user.id})
Motif: ${reason}
Durée: ${duration} minute(s)
Action: Mute. 🔇
\`\`\``
});


        } catch (err) {
            console.error(err);
            return interaction.reply({
                content: "❌ Impossible de mute ce membre.",
                ephemeral: true
            });
        }
    }
};
