const {
    SlashCommandBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    StringSelectMenuBuilder,
    RoleSelectMenuBuilder,
    UserSelectMenuBuilder,
    ChannelSelectMenuBuilder,
    ChannelType,
    ContainerBuilder,
    TextDisplayBuilder,
    SeparatorBuilder,
    SeparatorSpacingSize,
    MessageFlags
} = require("discord.js");

const { getShieldConfig, updateShieldConfig } = require("../systems/shieldConfig");
const { getPermissionList } = require("../systems/permissionLists");
const PermissionList = require("../models/PermissionList");
const COLORS = require("../config/colors").panel;

// ⚠️ À adapter : rôles autorisés à ouvrir le panel de configuration.
const ALLOWED_PANEL_ROLES = ["1506674274826584284"];

const MODULES = [
    { id: "antiSpam", label: "Message contenant du spam", icon: "🚫" },
    { id: "antiLink", label: "Message contenant des liens", icon: "🔗" },
    { id: "antiToxic", label: "Message contenant un taux de toxicité", icon: "☣️" },
    { id: "roleAdd", label: "Ajout de rôle", icon: "➕" },
    { id: "roleRemove", label: "Enlever un rôle", icon: "➖" },
    { id: "roleCreate", label: "Création de rôle", icon: "✨" },
    { id: "roleDelete", label: "Suppression de rôle", icon: "🗑️" },
    { id: "roleMove", label: "Déplacement de rôle", icon: "↕️" },
    { id: "channelCreate", label: "Création de salon", icon: "📁" },
    { id: "channelDelete", label: "Suppression de salon", icon: "📂" }
];

const PUNISHMENTS = [
    { value: "none", label: "Aucune sanction (log uniquement)", emoji: "🚫" },
    { value: "timeout", label: "Mise en sourdine", emoji: "🔇" },
    { value: "kick", label: "Expulsion", emoji: "👢" },
    { value: "ban", label: "Bannissement", emoji: "🔨" }
];

const TIMEOUT_DURATIONS = [
    { value: "60", label: "1 minute" },
    { value: "300", label: "5 minutes" },
    { value: "600", label: "10 minutes" },
    { value: "1800", label: "30 minutes" },
    { value: "3600", label: "1 heure" },
    { value: "86400", label: "24 heures" }
];

const EMOJIS = {
    enabled: "1531500779586981949",
    disabled: "1531500833785516213",
    logs: "1531503528219119727",
    salon: "1531503587589623880",
    close: "1531503556274688123"
};

const DEFAULT_MODULE_SETTINGS = {
    enabled: true,
    ignoredChannels: [],
    ignoredRoles: [],
    whitelistLinks: [],
    punishment: "timeout",
    timeoutDuration: 20,
    logsChannel: null,
    exemptOwners: false,
    exemptWhitelist: false
};

const PANEL_TIMEOUT_MS = 180_000;

function formatDuration(seconds) {
    const match = TIMEOUT_DURATIONS.find(d => Number(d.value) === Number(seconds));
    return match ? match.label : `${seconds}s`;
}

async function stampEdit(guildId, moduleId, patch, userId) {
    return updateShieldConfig(guildId, moduleId, {
        ...patch,
        lastEditedBy: userId,
        lastEditedAt: new Date()
    });
}

// ─── Container V2 (remplace l'embed du haut) ─────────────────────────────────

function buildContainer(module, config) {
    const punishmentLabel = PUNISHMENTS.find(p => p.value === config.punishment)?.label || config.punishment;

    const statusLines = [
        `État: ${config.enabled ? "✅" : "❌"}`,
        `Logs: ${config.logsChannel ? "✅" : "❌"}`,
        `Permission: ${(config.exemptOwners || config.exemptWhitelist || config.ignoredRoles.length) ? "🔓" : "🔒"}`,
        `Punition: ${punishmentLabel}${config.punishment === "timeout" ? ` (${formatDuration(config.timeoutDuration)})` : ""}.`,
        `Salon: ${config.ignoredChannels.length ? "✅" : "🔒"}`
    ];

    const container = new ContainerBuilder()
        .setAccentColor(config.enabled ? COLORS.enabled : COLORS.disabled)
        .addTextDisplayComponents(new TextDisplayBuilder().setContent(`### ${module.icon} ${module.label}`))
        .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true))
        .addTextDisplayComponents(new TextDisplayBuilder().setContent("```\n" + statusLines.join("\n") + "\n```"));

    if (config.ignoredRoles.length) {
        container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
                `**Rôles exemptés**\n${config.ignoredRoles.map(id => `> <@&${id}>`).join("\n")}`
            )
        );
    }

    if (config.lastEditedAt) {
        const ts = Math.floor(new Date(config.lastEditedAt).getTime() / 1000);
        container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(`-# Dernière modification <t:${ts}:R>`)
        );
    }

    return container;
}

function buildComponents(moduleId, config, permissionCounts, moduleStates) {
    const moduleSelect = new StringSelectMenuBuilder()
        .setCustomId("panel_module_select")
        .setPlaceholder("Choisis le module que tu souhaites configurer.")
        .addOptions(
            MODULES.map(m => ({
                label: m.label,
                value: m.id,
                emoji: { id: moduleStates[m.id] ? EMOJIS.enabled : EMOJIS.disabled },
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
                emoji: p.emoji,
                default: p.value === config.punishment
            }))
        );

    const permissionSelect = new StringSelectMenuBuilder()
        .setCustomId("panel_permission_select")
        .setPlaceholder("Choisis les utilisateurs autorisé.")
        .setMinValues(0)
        .setMaxValues(2)
        .addOptions([
            {
                label: `Utilisateur dans la liste des propriétaires. (${permissionCounts.owners})`,
                value: "owners",
                default: config.exemptOwners
            },
            {
                label: `Utilisateur dans la liste blanche. (${permissionCounts.whitelist})`,
                value: "whitelist",
                default: config.exemptWhitelist
            }
        ]);

    const independentSelect = new RoleSelectMenuBuilder()
        .setCustomId("panel_independent_select")
        .setPlaceholder("Utilisateur indépendant : rôle spécifique à ce module.")
        .setMinValues(0)
        .setMaxValues(10)
        .setDefaultRoles(config.ignoredRoles);

    const actionButtons = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId("panel_toggle")
            .setLabel(config.enabled ? "Désactiver" : "Activer")
            .setEmoji({ id: config.enabled ? EMOJIS.disabled : EMOJIS.enabled })
            .setStyle(config.enabled ? ButtonStyle.Danger : ButtonStyle.Success),
        new ButtonBuilder()
            .setCustomId("panel_options")
            .setLabel("Options")
            .setEmoji("⚙️")
            .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
            .setCustomId("panel_overview")
            .setLabel("Vue d'ensemble")
            .setEmoji("🛡️")
            .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
            .setCustomId("panel_close")
            .setLabel("Fermer")
            .setEmoji({ id: EMOJIS.close })
            .setStyle(ButtonStyle.Secondary)
    );

    return [
        new ActionRowBuilder().addComponents(moduleSelect),
        new ActionRowBuilder().addComponents(punitionSelect),
        new ActionRowBuilder().addComponents(permissionSelect),
        new ActionRowBuilder().addComponents(independentSelect),
        actionButtons
    ];
}

async function renderPanel(interaction, moduleId) {
    const module = MODULES.find(m => m.id === moduleId);
    const config = await getShieldConfig(interaction.guild.id, moduleId);
    const permissionList = await getPermissionList(interaction.guild.id);
    const permissionCounts = { owners: permissionList.owners.length, whitelist: permissionList.whitelist.length };

    // État de chaque module, pour afficher l'icône verte/rouge dans le select.
    const moduleStates = {};
    await Promise.all(
        MODULES.map(async m => {
            moduleStates[m.id] = m.id === moduleId
                ? config.enabled
                : (await getShieldConfig(interaction.guild.id, m.id)).enabled;
        })
    );

    return {
        components: [buildContainer(module, config), ...buildComponents(moduleId, config, permissionCounts, moduleStates)],
        flags: MessageFlags.IsComponentsV2
    };
}

function textMessage(text) {
    return {
        components: [new ContainerBuilder().addTextDisplayComponents(new TextDisplayBuilder().setContent(text))],
        flags: MessageFlags.IsComponentsV2
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

        await interaction.reply(payload);
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
                await interaction.editReply(textMessage("⏳ Panel expiré.")).catch(() => {});
                return;
            }

            const { customId } = componentInteraction;

            if (customId === "panel_close") {
                await componentInteraction.update(textMessage("Panel fermé."));
                return;
            }

            if (customId === "panel_module_select") {
                moduleId = componentInteraction.values[0];
                const newPayload = await renderPanel(interaction, moduleId);
                await componentInteraction.update(newPayload);
                continue;
            }

            if (customId === "panel_punition_select") {
                await stampEdit(interaction.guild.id, moduleId, { punishment: componentInteraction.values[0] }, interaction.user.id);
                const newPayload = await renderPanel(interaction, moduleId);
                await componentInteraction.update(newPayload);
                continue;
            }

            if (customId === "panel_permission_select") {
                const values = componentInteraction.values;
                await stampEdit(interaction.guild.id, moduleId, {
                    exemptOwners: values.includes("owners"),
                    exemptWhitelist: values.includes("whitelist")
                }, interaction.user.id);
                const newPayload = await renderPanel(interaction, moduleId);
                await componentInteraction.update(newPayload);
                continue;
            }

            if (customId === "panel_independent_select") {
                await stampEdit(interaction.guild.id, moduleId, { ignoredRoles: componentInteraction.values }, interaction.user.id);
                const newPayload = await renderPanel(interaction, moduleId);
                await componentInteraction.update(newPayload);
                continue;
            }

            if (customId === "panel_toggle") {
                const config = await getShieldConfig(interaction.guild.id, moduleId);
                await stampEdit(interaction.guild.id, moduleId, { enabled: !config.enabled }, interaction.user.id);
                const newPayload = await renderPanel(interaction, moduleId);
                await componentInteraction.update(newPayload);
                continue;
            }

            // =========================
            // VUE D'ENSEMBLE
            // =========================
            if (customId === "panel_overview") {
                const module = MODULES.find(m => m.id === moduleId);

                const rows = await Promise.all(MODULES.map(async m => {
                    const c = await getShieldConfig(interaction.guild.id, m.id);
                    const p = PUNISHMENTS.find(p => p.value === c.punishment)?.label || c.punishment;
                    return `${c.enabled ? "✅" : "❌"} ${m.icon} **${m.label}** — ${p}`;
                }));

                const overviewContainer = new ContainerBuilder()
                    .setAccentColor(COLORS.enabled)
                    .addTextDisplayComponents(new TextDisplayBuilder().setContent("### 🛡️ Vue d'ensemble"))
                    .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true))
                    .addTextDisplayComponents(new TextDisplayBuilder().setContent(rows.join("\n")));

                const backButton = new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setCustomId("panel_overview_back").setLabel("Retour").setStyle(ButtonStyle.Secondary)
                );

                await componentInteraction.update({
                    components: [overviewContainer, backButton],
                    flags: MessageFlags.IsComponentsV2
                });

                const backInteraction = await message
                    .awaitMessageComponent({ filter: i => i.user.id === interaction.user.id, time: PANEL_TIMEOUT_MS })
                    .catch(() => null);

                const newPayload = await renderPanel(interaction, moduleId);
                if (backInteraction) {
                    await backInteraction.update(newPayload);
                } else {
                    await interaction.editReply(newPayload).catch(() => {});
                }
                continue;
            }

            // =========================
            // OPTIONS (Logs / Salons / Durée / Listes / Réinitialiser)
            // =========================
            if (customId === "panel_options") {
                const module = MODULES.find(m => m.id === moduleId);
                const config = await getShieldConfig(interaction.guild.id, moduleId);

                const optionsSelect = new StringSelectMenuBuilder()
                    .setCustomId("panel_options_select")
                    .setPlaceholder("Que veux-tu régler ?")
                    .addOptions([
                        { label: "Salon de logs", value: "logs", emoji: { id: EMOJIS.logs } },
                        { label: "Salons ignorés", value: "salons", emoji: { id: EMOJIS.salon } },
                        ...(config.punishment === "timeout"
                            ? [{ label: "Durée du timeout", value: "duration", emoji: "⏱️" }]
                            : []),
                        { label: "Listes globales (propriétaires / whitelist)", value: "lists", emoji: "🗂️" },
                        { label: "Réinitialiser ce module", value: "reset", emoji: "♻️" }
                    ]);

                await componentInteraction.update({
                    components: [
                        new ContainerBuilder().addTextDisplayComponents(
                            new TextDisplayBuilder().setContent(`Que veux-tu régler pour **${module.label}** ?`)
                        ),
                        new ActionRowBuilder().addComponents(optionsSelect)
                    ],
                    flags: MessageFlags.IsComponentsV2
                });

                const optionInteraction = await message
                    .awaitMessageComponent({ filter: i => i.user.id === interaction.user.id, time: PANEL_TIMEOUT_MS })
                    .catch(() => null);

                if (!optionInteraction) {
                    const newPayload = await renderPanel(interaction, moduleId);
                    await interaction.editReply(newPayload).catch(() => {});
                    continue;
                }

                const choice = optionInteraction.values[0];

                // ── Salon de logs ──
                if (choice === "logs") {
                    const channelSelect = new ChannelSelectMenuBuilder()
                        .setCustomId("panel_logs_select")
                        .setPlaceholder("Choisis le salon de logs.")
                        .addChannelTypes(ChannelType.GuildText);

                    if (config.logsChannel) channelSelect.setDefaultChannels([config.logsChannel]);

                    await optionInteraction.update({
                        components: [
                            new ContainerBuilder().addTextDisplayComponents(
                                new TextDisplayBuilder().setContent("Choisis le salon de logs :")
                            ),
                            new ActionRowBuilder().addComponents(channelSelect)
                        ],
                        flags: MessageFlags.IsComponentsV2
                    });

                    const channelInteraction = await message
                        .awaitMessageComponent({ filter: i => i.user.id === interaction.user.id, time: PANEL_TIMEOUT_MS })
                        .catch(() => null);

                    if (channelInteraction) {
                        await stampEdit(interaction.guild.id, moduleId, { logsChannel: channelInteraction.values[0] }, interaction.user.id);
                        const newPayload = await renderPanel(interaction, moduleId);
                        await channelInteraction.update(newPayload);
                    } else {
                        const newPayload = await renderPanel(interaction, moduleId);
                        await interaction.editReply(newPayload).catch(() => {});
                    }
                    continue;
                }

                // ── Salons ignorés ──
                if (choice === "salons") {
                    const channelSelect = new ChannelSelectMenuBuilder()
                        .setCustomId("panel_salon_select")
                        .setPlaceholder("Choisis les salons ignorés par ce module.")
                        .addChannelTypes(ChannelType.GuildText)
                        .setMinValues(0)
                        .setMaxValues(10);

                    if (config.ignoredChannels.length) channelSelect.setDefaultChannels(config.ignoredChannels);

                    await optionInteraction.update({
                        components: [
                            new ContainerBuilder().addTextDisplayComponents(
                                new TextDisplayBuilder().setContent("Choisis les salons ignorés :")
                            ),
                            new ActionRowBuilder().addComponents(channelSelect)
                        ],
                        flags: MessageFlags.IsComponentsV2
                    });

                    const channelInteraction = await message
                        .awaitMessageComponent({ filter: i => i.user.id === interaction.user.id, time: PANEL_TIMEOUT_MS })
                        .catch(() => null);

                    if (channelInteraction) {
                        await stampEdit(interaction.guild.id, moduleId, { ignoredChannels: channelInteraction.values }, interaction.user.id);
                        const newPayload = await renderPanel(interaction, moduleId);
                        await channelInteraction.update(newPayload);
                    } else {
                        const newPayload = await renderPanel(interaction, moduleId);
                        await interaction.editReply(newPayload).catch(() => {});
                    }
                    continue;
                }

                // ── Durée du timeout ──
                if (choice === "duration") {
                    const durationSelect = new StringSelectMenuBuilder()
                        .setCustomId("panel_duration_select")
                        .setPlaceholder("Choisis la durée du timeout.")
                        .addOptions(
                            TIMEOUT_DURATIONS.map(d => ({
                                label: d.label,
                                value: d.value,
                                default: String(config.timeoutDuration) === d.value
                            }))
                        );

                    await optionInteraction.update({
                        components: [
                            new ContainerBuilder().addTextDisplayComponents(
                                new TextDisplayBuilder().setContent("Choisis la durée du timeout :")
                            ),
                            new ActionRowBuilder().addComponents(durationSelect)
                        ],
                        flags: MessageFlags.IsComponentsV2
                    });

                    const durationInteraction = await message
                        .awaitMessageComponent({ filter: i => i.user.id === interaction.user.id, time: PANEL_TIMEOUT_MS })
                        .catch(() => null);

                    if (durationInteraction) {
                        await stampEdit(interaction.guild.id, moduleId, {
                            timeoutDuration: parseInt(durationInteraction.values[0], 10)
                        }, interaction.user.id);
                        const newPayload = await renderPanel(interaction, moduleId);
                        await durationInteraction.update(newPayload);
                    } else {
                        const newPayload = await renderPanel(interaction, moduleId);
                        await interaction.editReply(newPayload).catch(() => {});
                    }
                    continue;
                }

                // ── Listes globales ──
                if (choice === "lists") {
                    const listChoiceSelect = new StringSelectMenuBuilder()
                        .setCustomId("panel_lists_choice")
                        .setPlaceholder("Quelle liste veux-tu modifier ?")
                        .addOptions([
                            { label: "Liste des propriétaires", value: "owners" },
                            { label: "Liste blanche", value: "whitelist" }
                        ]);

                    await optionInteraction.update({
                        components: [
                            new ContainerBuilder().addTextDisplayComponents(
                                new TextDisplayBuilder().setContent("Quelle liste veux-tu modifier ?")
                            ),
                            new ActionRowBuilder().addComponents(listChoiceSelect)
                        ],
                        flags: MessageFlags.IsComponentsV2
                    });

                    const choiceInteraction = await message
                        .awaitMessageComponent({ filter: i => i.user.id === interaction.user.id, time: PANEL_TIMEOUT_MS })
                        .catch(() => null);

                    if (!choiceInteraction) {
                        const newPayload = await renderPanel(interaction, moduleId);
                        await interaction.editReply(newPayload).catch(() => {});
                        continue;
                    }

                    const listName = choiceInteraction.values[0]; // "owners" | "whitelist"
                    const permissionList = await getPermissionList(interaction.guild.id);

                    const userSelect = new UserSelectMenuBuilder()
                        .setCustomId("panel_lists_users")
                        .setPlaceholder(
                            listName === "owners"
                                ? "Choisis les propriétaires."
                                : "Choisis les utilisateurs de la liste blanche."
                        )
                        .setMinValues(0)
                        .setMaxValues(25);

                    if (permissionList[listName].length) userSelect.setDefaultUsers(permissionList[listName]);

                    await choiceInteraction.update({
                        components: [
                            new ContainerBuilder().addTextDisplayComponents(
                                new TextDisplayBuilder().setContent(
                                    listName === "owners"
                                        ? "Choisis les propriétaires (remplace la liste actuelle) :"
                                        : "Choisis les utilisateurs de la liste blanche (remplace la liste actuelle) :"
                                )
                            ),
                            new ActionRowBuilder().addComponents(userSelect)
                        ],
                        flags: MessageFlags.IsComponentsV2
                    });

                    const usersInteraction = await message
                        .awaitMessageComponent({ filter: i => i.user.id === interaction.user.id, time: PANEL_TIMEOUT_MS })
                        .catch(() => null);

                    if (usersInteraction) {
                        await PermissionList.findOneAndUpdate(
                            { guildId: interaction.guild.id },
                            { $set: { [listName]: usersInteraction.values } },
                            { upsert: true }
                        );
                        const newPayload = await renderPanel(interaction, moduleId);
                        await usersInteraction.update(newPayload);
                    } else {
                        const newPayload = await renderPanel(interaction, moduleId);
                        await interaction.editReply(newPayload).catch(() => {});
                    }
                    continue;
                }

                // ── Réinitialiser ce module ──
                if (choice === "reset") {
                    const confirmRow = new ActionRowBuilder().addComponents(
                        new ButtonBuilder()
                            .setCustomId("panel_reset_confirm")
                            .setLabel("Confirmer la réinitialisation")
                            .setStyle(ButtonStyle.Danger),
                        new ButtonBuilder()
                            .setCustomId("panel_reset_cancel")
                            .setLabel("Annuler")
                            .setStyle(ButtonStyle.Secondary)
                    );

                    await optionInteraction.update({
                        components: [
                            new ContainerBuilder().addTextDisplayComponents(
                                new TextDisplayBuilder().setContent(
                                    `⚠️ Réinitialiser **${module.label}** aux réglages par défaut ?\nCette action est irréversible.`
                                )
                            ),
                            confirmRow
                        ],
                        flags: MessageFlags.IsComponentsV2
                    });

                    const confirmInteraction = await message
                        .awaitMessageComponent({ filter: i => i.user.id === interaction.user.id, time: PANEL_TIMEOUT_MS })
                        .catch(() => null);

                    if (confirmInteraction?.customId === "panel_reset_confirm") {
                        await stampEdit(interaction.guild.id, moduleId, { ...DEFAULT_MODULE_SETTINGS }, interaction.user.id);
                        const newPayload = await renderPanel(interaction, moduleId);
                        await confirmInteraction.update(newPayload);
                    } else if (confirmInteraction) {
                        const newPayload = await renderPanel(interaction, moduleId);
                        await confirmInteraction.update(newPayload);
                    } else {
                        const newPayload = await renderPanel(interaction, moduleId);
                        await interaction.editReply(newPayload).catch(() => {});
                    }
                    continue;
                }
            }
        }
    }
};
