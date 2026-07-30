const {
    SlashCommandBuilder,
    ChannelSelectMenuBuilder,
    ActionRowBuilder,
    ChannelType,
    ContainerBuilder,
    TextDisplayBuilder,
    MessageFlags
} = require("discord.js");

const { getCasinoChannel, setCasinoChannel } = require("../utils/managers/casinoChannelManager");

const MOD_ROLES = ["1517238655444451520", "1506674274826584284"];
const PANEL_TIMEOUT_MS = 60_000;

module.exports = {
    data: new SlashCommandBuilder()
        .setName("casinosalon")
        .setDescription("Configure le salon où la commande !attack est autorisée."),

    async execute(interaction) {
        const hasPermission = interaction.member.roles.cache.some(r => MOD_ROLES.includes(r.id));

        if (!hasPermission) {
            return interaction.reply({
                content: "❌ Tu n'as pas la permission d'utiliser cette commande.",
                ephemeral: true
            });
        }

        const currentChannelId = await getCasinoChannel(interaction.guild.id);

        const channelSelect = new ChannelSelectMenuBuilder()
            .setCustomId("casinosalon_select")
            .setPlaceholder("Choisis le salon casino (attack).")
            .addChannelTypes(ChannelType.GuildText);

        if (currentChannelId) channelSelect.setDefaultChannels([currentChannelId]);

        await interaction.reply({
            components: [
                new ContainerBuilder().addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(
                        currentChannelId
                            ? `Salon actuel : <#${currentChannelId}>\n\nChoisis un nouveau salon si besoin :`
                            : "Aucun salon n'est configuré. Choisis le salon où **!attack** sera autorisé :"
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

        const newChannelId = selectInteraction.values[0];
        await setCasinoChannel(interaction.guild.id, newChannelId);

        await selectInteraction.update({
            components: [
                new ContainerBuilder().addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(`✅ Le salon casino est maintenant <#${newChannelId}>.`)
                )
            ],
            flags: MessageFlags.IsComponentsV2
        });
    }
};
