const {
    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    StringSelectMenuBuilder,
    RoleSelectMenuBuilder,
    ChannelSelectMenuBuilder,
    ChannelType
} = require("discord.js");

const { getShieldConfig, updateShieldConfig } = require("../systems/shieldConfig");

// ⚠️ À adapter : rôles autorisés à ouvrir le panel de configuration.
const ALLOWED_PANEL_ROLES = ["1506674274826584284"];

const MODULES = [
    { id: "antiSpam", label: "Message contenant du spam" },
    { id: "antiLink", label: "Message contenant des liens" },
    { id: "antiToxic", label: "Message contenant un taux de toxicité" }
];

const PUNISHMENTS = [
    { value: "timeout", label: "Mise en sourdine" },
    { value: "kick", label: "Expulsion" },
    { value: "ban", label: "Bannissement" }
];

const PANEL_TIMEOUT_MS = 180_000;

// ─── Construction de l'embed récap (bloc du haut sur ta capture) ────────────

function buildEmbed(moduleLabel, config) {
    const punishmentLabel = PUNISHMENTS.find(p => p.value === config.punishment)?.label || config.punishment;

    const lines = [
        `État: ${config.enabled ? "✅" : "❌"}`,
        `Logs: ${config.logsChannel ? "✅" : "❌"}`,
        `Permission: ${config.ignoredRoles.length ? "🔓" : "🔒"}`,
        `Punition: ${punishmentLabel}${config.punishment === "timeout" ? ` (${config.timeoutDuration}s)` : ""}.`,
        `Salon: ${config.ignoredChannels.length ? "✅" : "🔒"}`
    ];

    if (config.ignoredRoles.length) {
        lines.push("", "Rôles exemptés:", ...config.ignoredRoles.map(id => `    • <@&${id}>`));
    }

    return new EmbedBuilder()
        .setColor(config.enabled ? "Green" : "Red")
        .setTitle(`• ${moduleLabel}`)
        .setDescription(lines.join("\n"));
}

// ─── Construction des lignes de composants (tout visible en même temps) ─────

function buildComponents(moduleId, config) {
    const moduleSelect = new StringSelectMenuBuilder()
        .setCustomId("panel_module_select")
        .setPlaceholder("Choisis le module que tu souhaites configurer.")
        .addOptions(
            MODULES.map(m => ({
                label: m.label,
                value: m.id,
                default: m.id === moduleId
            }))
        );

    const punitionSelect = new StringSelectMenuBuilder()
        .setCustomId("panel_punition_select")
        .setPlaceholder("Choisis la punition que le bot effectuera.")
        .addOptions(
            PUNISHMENTS.map(p => ({
                label: p.label,
                value: p.value,
                default: p.value === config.punishment
            }))
        );

    const permissionSelect = new RoleSelectMenuBuilder()
        .setCustomId("panel_permission_select")
        .setPlaceholder("Choisis les rôles exemptés de ce module.")
        .setMinValues(0)
        .setMaxValues(10)
        .setDefaultRoles(config.ignoredRoles);

    const actionButtons = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId("panel_toggle")
            .setLabel(config.enabled ? "Désactiver" : "Activer")
            .setEmoji(config.enabled ? { id: "1531500833785516213" } : { id: "1531500779586981949" })
            .setStyle(config.enabled ? ButtonStyle.Danger : ButtonStyle.Success),
        new ButtonBuilder()
            .setCustomId("panel_logs")
            .setLabel("Logs")
            .setEmoji({ id: "1531503528219119727" })
            .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
            .setCustomId("panel_salon")
            .setLabel("Salon")
            .setEmoji({ id: "1531503587589623880" })
            .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
            .setCustomId("panel_close")
            .setLabel("Fermer")
            .setEmoji({ id: "1531503556274688123" })
            .setStyle(ButtonStyle.Secondary)
    );

    return [
        new ActionRowBuilder().addComponents(moduleSelect),
        new ActionRowBuilder().addComponents(punitionSelect),
        new ActionRowBuilder().addComponents(permissionSelect),
        actionButtons
    ];
}

async function renderPanel(interaction, moduleId) {
    const moduleLabel = MODULES.find(m => m.id === moduleId).label;
    const config = await getShieldConfig(interaction.guild.id, moduleId);

    return {
        embeds: [buildEmbed(moduleLabel, config)],
        components: buildComponents(moduleId, config)
    };
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName("panel")
        .setDescription("Ouvre le panel de configuration des modules du bot."),

    async execute(interaction) {
        const hasPermission = interaction.member.roles.cache.some(role =>
            ALLOWED_PANEL_ROLES.includes(role.id)
        );

        if (!hasPermission) {
            return interaction.reply({
                content: "❌ Vous n'avez pas la permission.",
                ephemeral: true
            });
        }

        let moduleId = MODULES[0].id;
        const payload = await renderPanel(interaction, moduleId);

        await interaction.reply({ ...payload, ephemeral: true });
        const message = await interaction.fetchReply();

        // Boucle unique : tout se passe sur le même message, on le
        // met à jour (update) à chaque interaction plutôt que d'ouvrir
        // des étapes séparées.
        while (true) {
            let componentInteraction;
            try {
                componentInteraction = await message.awaitMessageComponent({
                    filter: i => i.user.id === interaction.user.id,
                    time: PANEL_TIMEOUT_MS
                });
            } catch {
                await interaction.editReply({ content: "⏳ Panel expiré.", embeds: [], components: [] }).catch(() => {});
                return;
            }

            const { customId } = componentInteraction;

            if (customId === "panel_close") {
                await componentInteraction.update({ content: "Panel fermé.", embeds: [], components: [] });
                return;
            }

            if (customId === "panel_module_select") {
                moduleId = componentInteraction.values[0];
                const newPayload = await renderPanel(interaction, moduleId);
                await componentInteraction.update(newPayload);
                continue;
            }

            if (customId === "panel_punition_select") {
                await updateShieldConfig(interaction.guild.id, moduleId, { punishment: componentInteraction.values[0] });
                const newPayload = await renderPanel(interaction, moduleId);
                await componentInteraction.update(newPayload);
                continue;
            }

            if (customId === "panel_permission_select") {
                await updateShieldConfig(interaction.guild.id, moduleId, { ignoredRoles: componentInteraction.values });
                const newPayload = await renderPanel(interaction, moduleId);
                await componentInteraction.update(newPayload);
                continue;
            }

            if (customId === "panel_toggle") {
                const config = await getShieldConfig(interaction.guild.id, moduleId);
                await updateShieldConfig(interaction.guild.id, moduleId, { enabled: !config.enabled });
                const newPayload = await renderPanel(interaction, moduleId);
                await componentInteraction.update(newPayload);
                continue;
            }

            if (customId === "panel_logs") {
                const config = await getShieldConfig(interaction.guild.id, moduleId);
                const channelSelect = new ChannelSelectMenuBuilder()
                    .setCustomId("panel_logs_select")
                    .setPlaceholder("Choisis le salon de logs.")
                    .addChannelTypes(ChannelType.GuildText);

                if (config.logsChannel) channelSelect.setDefaultChannels([config.logsChannel]);

                await componentInteraction.update({
                    content: "Choisis le salon de logs :",
                    embeds: [],
                    components: [new ActionRowBuilder().addComponents(channelSelect)]
                });

                const channelInteraction = await message
                    .awaitMessageComponent({ filter: i => i.user.id === interaction.user.id, time: PANEL_TIMEOUT_MS })
                    .catch(() => null);

                if (channelInteraction) {
                    await updateShieldConfig(interaction.guild.id, moduleId, { logsChannel: channelInteraction.values[0] });
                    const newPayload = await renderPanel(interaction, moduleId);
                    await channelInteraction.update(newPayload);
                } else {
                    const newPayload = await renderPanel(interaction, moduleId);
                    await interaction.editReply(newPayload).catch(() => {});
                }
                continue;
            }

            if (customId === "panel_salon") {
                const config = await getShieldConfig(interaction.guild.id, moduleId);
                const channelSelect = new ChannelSelectMenuBuilder()
                    .setCustomId("panel_salon_select")
                    .setPlaceholder("Choisis les salons ignorés par ce module.")
                    .addChannelTypes(ChannelType.GuildText)
                    .setMinValues(0)
                    .setMaxValues(10);

                if (config.ignoredChannels.length) channelSelect.setDefaultChannels(config.ignoredChannels);

                await componentInteraction.update({
                    content: "Choisis les salons ignorés :",
                    embeds: [],
                    components: [new ActionRowBuilder().addComponents(channelSelect)]
                });

                const channelInteraction = await message
                    .awaitMessageComponent({ filter: i => i.user.id === interaction.user.id, time: PANEL_TIMEOUT_MS })
                    .catch(() => null);

                if (channelInteraction) {
                    await updateShieldConfig(interaction.guild.id, moduleId, { ignoredChannels: channelInteraction.values });
                    const newPayload = await renderPanel(interaction, moduleId);
                    await channelInteraction.update(newPayload);
                } else {
                    const newPayload = await renderPanel(interaction, moduleId);
                    await interaction.editReply(newPayload).catch(() => {});
                }
                continue;
            }
        }
    }
};
