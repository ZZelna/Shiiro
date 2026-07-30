const {
    SlashCommandBuilder,
    ChannelSelectMenuBuilder,
    ActionRowBuilder,
    ChannelType,
    ContainerBuilder,
    TextDisplayBuilder,
    MessageFlags
} = require("discord.js");

const { getCasinoChannels, setCasinoChannels } = require("../utils/managers/casinoChannelManager");

const MOD_ROLES = ["1517238655444451520", "1506674274826584284"];
const PANEL_TIMEOUT_MS = 60_000;

module.exports = {
    data: new SlashCommandBuilder()
        .setName("casinosalon")
        .setDescription("Configure les salons où la commande !attack est autorisée."),

    async execute(interaction) {
        const hasPermission = interaction.member.roles.cache.some(r => MOD_ROLES.includes(r.id));

        if (!hasPermission) {
            return interaction.reply({
                content: "❌ Tu n'as pas la permission d'utiliser cette commande.",
                ephemeral: true
            });
        }

        const currentChannelIds = await getCasinoChannels(interaction.guild.id);

        const channelSelect = new ChannelSelectMenuBuilder()
            .setCustomId("casinosalon_select")
            .setPlaceholder("Choisis les salons casino (attack).")
            .addChannelTypes(ChannelType.GuildText)
            .setMinValues(0)
            .setMaxValues(10);

        if (currentChannelIds.length) channelSelect.setDefaultChannels(currentChannelIds);

        await interaction.reply({
            components: [
                new ContainerBuilder().addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(
                        currentChannelIds.length
                            ? `Salons actuels : ${currentChannelIds.map(id => `<#${id}>`).join(", ")}\n\nChoisis les nouveaux salons (remplace la liste actuelle) :`
                            : "Aucun salon n'est configuré. Choisis jusqu'à 10 salons où **!attack** sera autorisé :"
                    )
                ),
                new ActionRowBuilder().addComponents(channelSelect)
            ],
            flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral
        });

        const message = await interaction.fetchReply();

        const selectInteraction = await message
            .awaitMessageComponent({ filter: i => i.user.id === interaction.user.id, time: PANEL_TIMEOUT_MS })
            .catch(() => null);

        if (!selectInteraction) {
            return interaction.editReply({
                components: [
                    new ContainerBuilder().addTextDisplayComponents(
                        new TextDisplayBuilder().setContent("⏳ Temps écoulé, rien n'a été changé.")
                    )
                ],
                flags: MessageFlags.IsComponentsV2
            }).catch(() => {});
        }

        const newChannelIds = selectInteraction.values;
        await setCasinoChannels(interaction.guild.id, newChannelIds);

        await selectInteraction.update({
            components: [
                new ContainerBuilder().addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(
                        newChannelIds.length
                            ? `✅ Salons casino mis à jour : ${newChannelIds.map(id => `<#${id}>`).join(", ")}`
                            : "✅ Aucun salon configuré (liste vidée)."
                    )
                )
            ],
            flags: MessageFlags.IsComponentsV2
        });
    }
};
