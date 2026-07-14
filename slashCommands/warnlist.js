const {
    SlashCommandBuilder,
    ContainerBuilder,
    TextDisplayBuilder,
    SeparatorBuilder,
    SeparatorSpacingSize,
    MessageFlags
} = require("discord.js");

const Warn = require("../models/Warn");

const WARN1_ROLE = "1518890473727463485";
const WARN2_ROLE = "1518890512172453898";
const WARN3_ROLE = "1518890554652496013";
const BAN_ROLE = "1518890629310971944";

// ─── Récupère les membres d'un rôle + le motif/modérateur de leur dernier warn ─
async function buildWarnLines(guild, roleId, level) {
    const role = guild.roles.cache.get(roleId);
    const members = role ? [...role.members.values()] : [];

    if (members.length === 0) return "Aucun";

    const lines = await Promise.all(members.map(async member => {
        const lastWarn = await Warn.findOne({
            guildId: guild.id,
            userId: member.id,
            level
        }).sort({ createdAt: -1 });

        if (!lastWarn) {
            return `**${member.user.tag}**\n> Motif inconnu (aucun historique enregistré)`;
        }

        return `**${member.user.tag}**\n> Motif : ${lastWarn.motif} • Par <@${lastWarn.moderatorId}>`;
    }));

    return lines.join("\n\n").slice(0, 3800); // marge de sécurité sous la limite V2
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName("warnlist")
        .setDescription("Affiche tous les membres warn"),

    async execute(interaction) {

        await interaction.deferReply();

        const guild = interaction.guild;

        const [warn1, warn2, warn3, ban] = await Promise.all([
            buildWarnLines(guild, WARN1_ROLE, 1),
            buildWarnLines(guild, WARN2_ROLE, 2),
            buildWarnLines(guild, WARN3_ROLE, 3),
            buildWarnLines(guild, BAN_ROLE, 4)
        ]);

        const container = new ContainerBuilder()
            .setAccentColor(0xFFA500)
            .addTextDisplayComponents(
                new TextDisplayBuilder().setContent("## 📋 Liste des Warns")
            )
            .addSeparatorComponents(
                new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
            )
            .addTextDisplayComponents(
                new TextDisplayBuilder().setContent(`### ⚠️ Warn 1\n${warn1}`)
            )
            .addTextDisplayComponents(
                new TextDisplayBuilder().setContent(`### ⚠️ Warn 2\n${warn2}`)
            )
            .addTextDisplayComponents(
                new TextDisplayBuilder().setContent(`### ⚠️ Warn 3\n${warn3}`)
            )
            .addTextDisplayComponents(
                new TextDisplayBuilder().setContent(`### 🚨 BAN\n${ban}`)
            );

        await interaction.editReply({
            components: [container],
            flags: MessageFlags.IsComponentsV2
        });
    }
};
