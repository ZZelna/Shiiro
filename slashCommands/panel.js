const {
    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    StringSelectMenuBuilder,
    RoleSelectMenuBuilder,
    ChannelSelectMenuBuilder,
    ChannelType,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle
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

const PANEL_TIMEOUT_MS = 120_000;

function buildModuleSelectRow() {
    const select = new StringSelectMenuBuilder()
        .setCustomId("panel_module_select")
        .setPlaceholder("Choisis le module que tu souhaites configurer.")
        .addOptions(MODULES.map(m => ({ label: m.label, value: m.id })));

    return new ActionRowBuilder().addComponents(select);
}

function buildConfigEmbed(moduleLabel, config) {
    const punishmentLabel = PUNISHMENTS.find(p => p.value === config.punishment)?.label || config.punishment;

    return new EmbedBuilder()
        .setColor(config.enabled ? "Green" : "Red")
        .setTitle(`⚙️ ${moduleLabel}`)
        .addFields(
            { name: "État", value: config.enabled ? "✅ Activé" : "🚫 Désactivé", inline: true },
            {
                name: "Punition",
                value: config.punishment === "timeout"
                    ? `${punishmentLabel} (${config.timeoutDuration}s)`
                    : punishmentLabel,
                inline: true
            },
            { name: "Logs", value: config.logsChannel ? `<#${config.logsChannel}>` : "Non défini", inline: true },
            {
                name: "Salons ignorés",
                value: config.ignoredChannels.length ? config.ignoredChannels.map(id => `<#${id}>`).join(", ") : "Aucun"
            },
            {
                name: "Rôles exemptés (Permission)",
                value: config.ignoredRoles.length ? config.ignoredRoles.map(id => `<@&${id}>`).join(", ") : "Aucun"
            }
        );
}

function buildActionRows(moduleId, enabled) {
    const row1 = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId(`panel_toggle_${moduleId}`)
            .setLabel(enabled ? "Désactiver" : "Activer")
            .setStyle(enabled ? ButtonStyle.Danger : ButtonStyle.Success),
        new ButtonBuilder()
            .setCustomId(`panel_permission_${moduleId}`)
            .setLabel("Permission")
            .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
            .setCustomId(`panel_logs_${moduleId}`)
            .setLabel("Logs")
            .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
            .setCustomId(`panel_salon_${moduleId}`)
            .setLabel("Salon")
            .setStyle(ButtonStyle.Primary)
    );

    const row2 = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId(`panel_punition_${moduleId}`)
            .setLabel("Punition")
            .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
            .setCustomId("panel_back")
            .setLabel("Retour")
            .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
            .setCustomId("panel_close")
            .setLabel("Fermer")
            .setStyle(ButtonStyle.Danger)
    );

    return [row1, row2];
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

        await interaction.reply({
            content: "**Choisis le module que tu souhaites configurer.**",
            components: [buildModuleSelectRow()],
            ephemeral: true
        });

        const message = await interaction.fetchReply();
        await runModuleSelectLoop(interaction, message);
    }
};

async function runModuleSelectLoop(interaction, message) {
    let selectInteraction;
    try {
        selectInteraction = await message.awaitMessageComponent({
            filter: i => i.user.id === interaction.user.id,
            time: PANEL_TIMEOUT_MS
        });
    } catch {
        return interaction.editReply({ content: "⏳ Panel expiré.", components: [] }).catch(() => {});
    }

    if (selectInteraction.customId === "panel_close") {
        return selectInteraction.update({ content: "Panel fermé.", embeds: [], components: [] });
    }

    if (selectInteraction.customId === "panel_back") {
        await selectInteraction.update({
            content: "**Choisis le module que tu souhaites configurer.**",
            embeds: [],
            components: [buildModuleSelectRow()]
        });
        return runModuleSelectLoop(interaction, message);
    }

    if (selectInteraction.customId === "panel_module_select") {
        const moduleId = selectInteraction.values[0];
        await selectInteraction.deferUpdate();
        return runModulePanel(interaction, message, moduleId);
    }

    return runModuleSelectLoop(interaction, message);
}

async function runModulePanel(interaction, message, moduleId) {
    const moduleLabel = MODULES.find(m => m.id === moduleId).label;
    const config = await getShieldConfig(interaction.guild.id, moduleId);

    await interaction.editReply({
        content: "",
        embeds: [buildConfigEmbed(moduleLabel, config)],
        components: buildActionRows(moduleId, config.enabled)
    });

    let componentInteraction;
    try {
        componentInteraction = await message.awaitMessageComponent({
            filter: i => i.user.id === interaction.user.id,
            time: PANEL_TIMEOUT_MS
        });
    } catch {
        return interaction.editReply({ content: "⏳ Panel expiré.", embeds: [], components: [] }).catch(() => {});
    }

    const { customId } = componentInteraction;

    if (customId === "panel_close") {
        return componentInteraction.update({ content: "Panel fermé.", embeds: [], components: [] });
    }

    if (customId === "panel_back") {
        await componentInteraction.update({
            content: "**Choisis le module que tu souhaites configurer.**",
            embeds: [],
            components: [buildModuleSelectRow()]
        });
        return runModuleSelectLoop(interaction, message);
    }

    if (customId === `panel_toggle_${moduleId}`) {
        await updateShieldConfig(interaction.guild.id, moduleId, { enabled: !config.enabled });
        await componentInteraction.deferUpdate();
        return runModulePanel(interaction, message, moduleId);
    }

    if (customId === `panel_permission_${moduleId}`) {
        const roleSelect = new RoleSelectMenuBuilder()
            .setCustomId(`panel_permission_select_${moduleId}`)
            .setPlaceholder("Choisis les rôles exemptés de ce module.")
            .setMinValues(0)
            .setMaxValues(10);

        await componentInteraction.update({
            content: "Choisis les rôles exemptés :",
            embeds: [],
            components: [new ActionRowBuilder().addComponents(roleSelect)]
        });

        const roleInteraction = await message
            .awaitMessageComponent({ filter: i => i.user.id === interaction.user.id, time: PANEL_TIMEOUT_MS })
            .catch(() => null);

        if (roleInteraction) {
            await updateShieldConfig(interaction.guild.id, moduleId, { ignoredRoles: roleInteraction.values });
            await roleInteraction.deferUpdate();
        }
        return runModulePanel(interaction, message, moduleId);
    }

    if (customId === `panel_logs_${moduleId}`) {
        const channelSelect = new ChannelSelectMenuBuilder()
            .setCustomId(`panel_logs_select_${moduleId}`)
            .setPlaceholder("Choisis le salon de logs.")
            .addChannelTypes(ChannelType.GuildText);

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
            await channelInteraction.deferUpdate();
        }
        return runModulePanel(interaction, message, moduleId);
    }

    if (customId === `panel_salon_${moduleId}`) {
        const channelSelect = new ChannelSelectMenuBuilder()
            .setCustomId(`panel_salon_select_${moduleId}`)
            .setPlaceholder("Choisis les salons ignorés par ce module.")
            .addChannelTypes(ChannelType.GuildText)
            .setMinValues(0)
            .setMaxValues(10);

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
            await channelInteraction.deferUpdate();
        }
        return runModulePanel(interaction, message, moduleId);
    }

    if (customId === `panel_punition_${moduleId}`) {
        const punitionSelect = new StringSelectMenuBuilder()
            .setCustomId(`panel_punition_select_${moduleId}`)
            .setPlaceholder("Choisis la punition que le bot effectuera.")
            .addOptions(PUNISHMENTS.map(p => ({ label: p.label, value: p.value })));

        await componentInteraction.update({
            content: "**Choisis la punition que le bot effectuera.**",
            embeds: [],
            components: [new ActionRowBuilder().addComponents(punitionSelect)]
        });

        const punitionInteraction = await message
            .awaitMessageComponent({ filter: i => i.user.id === interaction.user.id, time: PANEL_TIMEOUT_MS })
            .catch(() => null);

        if (!punitionInteraction) {
            return runModulePanel(interaction, message, moduleId);
        }

        const chosenPunishment = punitionInteraction.values[0];

        // Si "timeout" est choisi, on demande la durée via une modale.
        if (chosenPunishment === "timeout") {
            const modal = new ModalBuilder()
                .setCustomId(`panel_timeout_modal_${moduleId}`)
                .setTitle("Durée de la mise en sourdine");

            const durationInput = new TextInputBuilder()
                .setCustomId("duration")
                .setLabel("Durée en secondes")
                .setStyle(TextInputStyle.Short)
                .setValue(String(config.timeoutDuration))
                .setRequired(true);

            modal.addComponents(new ActionRowBuilder().addComponents(durationInput));

            await punitionInteraction.showModal(modal);

            const modalInteraction = await punitionInteraction
                .awaitModalSubmit({ filter: i => i.user.id === interaction.user.id, time: PANEL_TIMEOUT_MS })
                .catch(() => null);

            if (modalInteraction) {
                const seconds = parseInt(modalInteraction.fields.getTextInputValue("duration"), 10);
                await updateShieldConfig(interaction.guild.id, moduleId, {
                    punishment: "timeout",
                    timeoutDuration: Number.isFinite(seconds) && seconds > 0 ? seconds : config.timeoutDuration
                });
                await modalInteraction.deferUpdate();
            }
        } else {
            await updateShieldConfig(interaction.guild.id, moduleId, { punishment: chosenPunishment });
            await punitionInteraction.deferUpdate();
        }

        return runModulePanel(interaction, message, moduleId);
    }

    return runModulePanel(interaction, message, moduleId);
}
