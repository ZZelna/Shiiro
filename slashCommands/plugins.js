const {
    SlashCommandBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    StringSelectMenuBuilder,
    ContainerBuilder,
    TextDisplayBuilder,
    SeparatorBuilder,
    SeparatorSpacingSize,
    MessageFlags
} = require("discord.js");

const { PLUGINS, getPluginConfig, resolveState, setPluginEnabled } = require("../systems/pluginConfig");

// ⚠️ À adapter : rôles autorisés à gérer les plugins.
const ALLOWED_ROLES = ["1506674274826584284"];

const PANEL_TIMEOUT_MS = 180_000;

function buildContainer(doc, selectedPluginId) {
    const lines = ["**🧩 Gestionnaire de plugins**", ""];

    for (const plugin of PLUGINS) {
        const state = resolveState(doc, plugin.id);
        lines.push(`${state ? "🟢" : "🔴"} ${plugin.label}`);
    }

    const container = new ContainerBuilder()
        .setAccentColor(0x5865F2)
        .addTextDisplayComponents(new TextDisplayBuilder().setContent(lines.join("\n")));

    if (selectedPluginId) {
        const plugin = PLUGINS.find(p => p.id === selectedPluginId);
        const state = resolveState(doc, selectedPluginId);

        container
            .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true))
            .addTextDisplayComponents(
                new TextDisplayBuilder().setContent(
                    `**${plugin.label}** — ${state ? "🟢 Activé" : "🔴 Désactivé"}`
                )
            );
    }

    return container;
}

function buildComponents(selectedPluginId, enabled) {
    const pluginSelect = new StringSelectMenuBuilder()
        .setCustomId("plugins_select")
        .setPlaceholder("Choisis le plugin à gérer.")
        .addOptions(
            PLUGINS.map(p => ({
                label: p.label,
                value: p.id,
                default: p.id === selectedPluginId
            }))
        );

    const rows = [new ActionRowBuilder().addComponents(pluginSelect)];

    if (selectedPluginId) {
        rows.push(
            new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId("plugins_install")
                    .setLabel("Installer")
                    .setStyle(ButtonStyle.Success)
                    .setDisabled(enabled),
                new ButtonBuilder()
                    .setCustomId("plugins_update")
                    .setLabel("Mettre à jour")
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(!enabled),
                new ButtonBuilder()
                    .setCustomId("plugins_remove")
                    .setLabel("Supprimer")
                    .setStyle(ButtonStyle.Danger)
                    .setDisabled(!enabled)
            )
        );
    }

    return rows;
}

async function renderPlugins(interaction, selectedPluginId) {
    const doc = await getPluginConfig(interaction.guild.id);
    const enabled = selectedPluginId ? resolveState(doc, selectedPluginId) : null;

    return {
        components: [buildContainer(doc, selectedPluginId), ...buildComponents(selectedPluginId, enabled)],
        flags: MessageFlags.IsComponentsV2
    };
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName("plugins")
        .setDescription("Active ou désactive les grands systèmes du bot."),

    async execute(interaction) {
        const hasPermission = interaction.member.roles.cache.some(role =>
            ALLOWED_ROLES.includes(role.id)
        );

        if (!hasPermission) {
            return interaction.reply({
                content: "❌ Vous n'avez pas la permission.",
                ephemeral: true
            });
        }

        let selectedPluginId = null;
        const payload = await renderPlugins(interaction, selectedPluginId);

        await interaction.reply(payload);
        const message = await interaction.fetchReply();

        while (true) {
            let componentInteraction;
            try {
                componentInteraction = await message.awaitMessageComponent({
                    filter: i => i.user.id === interaction.user.id,
                    time: PANEL_TIMEOUT_MS
                });
            } catch {
                return;
            }

            const { customId } = componentInteraction;

            if (customId === "plugins_select") {
                selectedPluginId = componentInteraction.values[0];
                const newPayload = await renderPlugins(interaction, selectedPluginId);
                await componentInteraction.update(newPayload);
                continue;
            }

            if (customId === "plugins_install") {
                await setPluginEnabled(interaction.guild.id, selectedPluginId, true);
                const newPayload = await renderPlugins(interaction, selectedPluginId);
                await componentInteraction.update(newPayload);
                continue;
            }

            if (customId === "plugins_remove") {
                await setPluginEnabled(interaction.guild.id, selectedPluginId, false);
                const newPayload = await renderPlugins(interaction, selectedPluginId);
                await componentInteraction.update(newPayload);
                continue;
            }

            if (customId === "plugins_update") {
                // Pas d'action DB : sert juste à rafraîchir l'affichage pour l'instant.
                const newPayload = await renderPlugins(interaction, selectedPluginId);
                await componentInteraction.update(newPayload);
                continue;
            }
        }
    }
};
