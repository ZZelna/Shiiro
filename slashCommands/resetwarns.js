const {
    SlashCommandBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ContainerBuilder,
    TextDisplayBuilder,
    MessageFlags
} = require("discord.js");

const Warn = require("../models/Warn");

const WARN1_ROLE = "1518890473727463485";
const WARN2_ROLE = "1518890512172453898";
const WARN3_ROLE = "1518890554652496013";
const BAN_ROLE = "1518890629310971944";

const ALLOWED_ROLE = "1506674274826584284";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("resetwarns")
        .setDescription("Réinitialise TOUS les warns du serveur (irréversible)"),

    async execute(interaction) {

        const hasPermission = interaction.member.roles.cache.has(ALLOWED_ROLE);

        if (!hasPermission) {
            return interaction.reply({
                content: "❌ Vous n'avez pas la permission.",
                ephemeral: true
            });
        }

        const confirmContainer = new ContainerBuilder()
            .setAccentColor(0xED4245)
            .addTextDisplayComponents(
                new TextDisplayBuilder().setContent("## ⚠️ Réinitialiser TOUS les warns")
            )
            .addTextDisplayComponents(
                new TextDisplayBuilder().setContent(
                    "Cette action va :\n" +
                    "• Retirer les rôles Warn 1/2/3 et BAN à **tous** les membres concernés\n" +
                    "• Supprimer **tout l'historique** des warns (motifs, modérateurs)\n\n" +
                    "**Cette action est irréversible.** Confirmer ?"
                )
            )
            .addActionRowComponents(
                new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId("resetwarns_confirm")
                        .setLabel("Confirmer")
                        .setEmoji("✅")
                        .setStyle(ButtonStyle.Danger),
                    new ButtonBuilder()
                        .setCustomId("resetwarns_cancel")
                        .setLabel("Annuler")
                        .setEmoji("❌")
                        .setStyle(ButtonStyle.Secondary)
                )
            );

        const msg = await interaction.reply({
            components: [confirmContainer],
            flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
            withResponse: true
        });

        const collector = msg.resource.message.createMessageComponentCollector({
            filter: i => i.user.id === interaction.user.id,
            time: 15000,
            max: 1
        });

        collector.on("collect", async (i) => {

            if (i.customId === "resetwarns_cancel") {
                return i.update({
                    components: [
                        new TextDisplayBuilder().setContent("❌ Réinitialisation annulée.")
                    ],
                    flags: MessageFlags.IsComponentsV2
                });
            }

            // ─── Confirmation : exécution du reset ────────────────────────────
            await i.update({
                components: [
                    new TextDisplayBuilder().setContent("⏳ Réinitialisation en cours...")
                ],
                flags: MessageFlags.IsComponentsV2
            });

            const roleIds = [WARN1_ROLE, WARN2_ROLE, WARN3_ROLE, BAN_ROLE];
            const guild = interaction.guild;

            await guild.members.fetch();

            let membersCleared = 0;

            for (const roleId of roleIds) {
                const role = guild.roles.cache.get(roleId);
                if (!role) continue;

                for (const member of role.members.values()) {
                    await member.roles.remove(roleId).catch(() => {});
                    membersCleared++;
                }
            }

            const deleteResult = await Warn.deleteMany({ guildId: guild.id });

            const resultContainer = new ContainerBuilder()
                .setAccentColor(0x2ECC71)
                .addTextDisplayComponents(
                    new TextDisplayBuilder().setContent("## ✅ Warns réinitialisés")
                )
                .addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(
                        `**Rôles retirés :** ${membersCleared}\n` +
                        `**Entrées d'historique supprimées :** ${deleteResult.deletedCount}`
                    )
                );

            await interaction.editReply({
                components: [resultContainer],
                flags: MessageFlags.IsComponentsV2
            });
        });

        collector.on("end", async (collected) => {
            if (collected.size === 0) {
                await interaction.editReply({
                    components: [
                        new TextDisplayBuilder().setContent("❌ Délai dépassé, réinitialisation annulée.")
                    ],
                    flags: MessageFlags.IsComponentsV2
                }).catch(() => {});
            }
        });

    }
};
