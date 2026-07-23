const {
    ContainerBuilder,
    TextDisplayBuilder,
    SeparatorBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    MessageFlags,
} = require("discord.js");

// 🔧 Configure ici les rôles de pings proposés aux membres
const PING_ROLES = [
    { id: "1507068883541032970", label: "Animations Ping", emoji: "🧩" },
    { id: "1507068991624056992", label: "Casino Ping", emoji: "💴" },
    { id: "1509970024167903352", label: "Nitro Ping", emoji: "🔮" },
    { id: "1507068934912999535", label: "Partenariats Ping", emoji: "🤝" },
    { id: "1508529433269633204", label: "Recrutement Ping", emoji: "🛡️" },
    { id: "1515021439927980192", label: "Ping nouveautés", emoji: "🎭" },
];

// Construit le message Components V2 avec l'état actuel des boutons
function buildPingContainer(member) {
    const container = new ContainerBuilder()
        .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
                "## 🔔 Choisis tes pings\nClique sur un bouton pour activer ou désactiver le rôle correspondant."
            )
        )
        .addSeparatorComponents(new SeparatorBuilder());

    // Discord limite chaque ActionRow à 5 boutons max, on découpe donc par groupes de 5
    const MAX_BUTTONS_PER_ROW = 5;
    for (let i = 0; i < PING_ROLES.length; i += MAX_BUTTONS_PER_ROW) {
        const chunk = PING_ROLES.slice(i, i + MAX_BUTTONS_PER_ROW);
        const row = new ActionRowBuilder();

        for (const role of chunk) {
            const hasRole = member.roles.cache.has(role.id);
            row.addComponents(
                new ButtonBuilder()
                    .setCustomId(`ping_toggle_${role.id}`)
                    .setLabel(role.label)
                    .setEmoji(role.emoji)
                    .setStyle(hasRole ? ButtonStyle.Success : ButtonStyle.Secondary)
            );
        }

        container.addActionRowComponents(row);
    }

    return container;
}

// Handler appelé depuis interactionCreate.js, comme les autres handlers du dossier
module.exports = async (interaction) => {
    if (!interaction.isButton()) return;
    if (!interaction.customId.startsWith("ping_toggle_")) return;

    const roleId = interaction.customId.replace("ping_toggle_", "");
    const role = interaction.guild.roles.cache.get(roleId);

    if (!role) {
        return interaction.reply({ content: "❌ Ce rôle n'existe plus.", flags: MessageFlags.Ephemeral });
    }

    const member = interaction.member;
    const hasRole = member.roles.cache.has(roleId);

    try {
        if (hasRole) {
            await member.roles.remove(roleId);
        } else {
            await member.roles.add(roleId);
        }
    } catch (err) {
        console.error(err);
        return interaction.reply({
            content: "❌ Je n'ai pas la permission de gérer ce rôle (vérifie la hiérarchie des rôles).",
            flags: MessageFlags.Ephemeral,
        });
    }

    const container = buildPingContainer(member);
    await interaction.update({
        components: [container],
        flags: MessageFlags.IsComponentsV2,
    });
};

module.exports.PING_ROLES = PING_ROLES;
module.exports.buildPingContainer = buildPingContainer;
