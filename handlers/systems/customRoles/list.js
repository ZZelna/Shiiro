const {
    ContainerBuilder,
    TextDisplayBuilder,
    SeparatorBuilder,
    SeparatorSpacingSize,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder,
    EmbedBuilder,
    MessageFlags
} = require("discord.js");
const CustomRole = require("../../../models/CustomRole");

const ROLES_PER_PAGE = 10;

module.exports = async (interaction) => {

    let roles = await CustomRole.find({
        guildId: interaction.guild.id
    }).sort({
        createdAt: 1
    });

    if (!roles.length) {
        return interaction.reply({
            content: "❌ Aucun rôle personnalisé trouvé.",
            ephemeral: true
        });
    }

    let page = 0;

    const getMaxPage = () =>
        Math.max(1, Math.ceil(roles.length / ROLES_PER_PAGE));

    async function buildContainer() {

        const maxPage = getMaxPage();

        if (page >= maxPage)
            page = maxPage - 1;

        const start = page * ROLES_PER_PAGE;

        const currentRoles = roles.slice(
            start,
            start + ROLES_PER_PAGE
        );

        let content = "";

        const select =
            new StringSelectMenuBuilder()

                .setCustomId("customroles_select")

                .setPlaceholder(
                    "🎭 Sélectionnez un rôle personnalisé"
                );

        for (let i = 0; i < currentRoles.length; i++) {

            const role = currentRoles[i];

            const discordRole =
                interaction.guild.roles.cache.get(
                    role.roleId
                );

            const owner =
                await interaction.client.users
                    .fetch(role.userId)
                    .catch(() => null);

            const memberCount =
                discordRole?.members.size || 0;

            const shared =
                role.sharedWith?.length || 0;

            const created =
                role.createdAt
                    ? `<t:${Math.floor(
                        role.createdAt.getTime() / 1000
                    )}:R>`
                    : "Inconnue";

            content +=

`## 👑 ${role.name}

👤 **Propriétaire**
${owner ? `${owner.username} (\`${owner.id}\`)` : "Introuvable"}

🏷️ **Commande**
\`+${role.commandName}\`

👥 **Membres**
${memberCount}

🤝 **Partagé avec**
${shared}

🎨 **Couleur**
\`${role.color}\`

🆔 **ID**
\`${role.roleId}\`

📅 **Création**
${created}

━━━━━━━━━━━━━━━━━━━━━━

`;

            select.addOptions(

                new StringSelectMenuOptionBuilder()

                    .setLabel(
                        role.name.slice(0, 100)
                    )

                    .setDescription(
                        `+${role.commandName}`
                    )

                    .setValue(
                        role._id.toString()
                    )

            );

        }

        return new ContainerBuilder()

            .setAccentColor(0x5865F2)

            .addTextDisplayComponents(

                new TextDisplayBuilder()

                    .setContent(

`# 🎭 Gestion des rôles personnalisés

**${roles.length}** rôle(s) enregistré(s)`

                    )

            )

            .addSeparatorComponents(

                new SeparatorBuilder()

                    .setDivider(true)

                    .setSpacing(
                        SeparatorSpacingSize.Small
                    )

            )

            .addTextDisplayComponents(

                new TextDisplayBuilder()

                    .setContent(content)

            )

            .addSeparatorComponents(

                new SeparatorBuilder()

                    .setDivider(true)

                    .setSpacing(
                        SeparatorSpacingSize.Small
                    )

            )

            .addActionRowComponents(

                new ActionRowBuilder()

                    .addComponents(select)

            )

            .addActionRowComponents(

                new ActionRowBuilder()

                    .addComponents(

                        new ButtonBuilder()

                            .setCustomId(
                                "customroles_prev"
                            )

                            .setEmoji("◀️")

                            .setStyle(
                                ButtonStyle.Secondary
                            )

                            .setDisabled(page === 0),

                        new ButtonBuilder()

                            .setCustomId(
                                "customroles_refresh"
                            )

                            .setEmoji("🔄")

                            .setStyle(
                                ButtonStyle.Primary
                            ),

                        new ButtonBuilder()

                            .setCustomId(
                                "customroles_next"
                            )

                            .setEmoji("▶️")

                            .setStyle(
                                ButtonStyle.Secondary
                            )

                            .setDisabled(
                                page >= maxPage - 1
                            ),

                        new ButtonBuilder()

                            .setCustomId(
                                "customroles_back"
                            )

                            .setEmoji("🏠")

                            .setStyle(
                                ButtonStyle.Success
                            ),

                        new ButtonBuilder()

                            .setCustomId(
                                "customroles_close"
                            )

                            .setEmoji("❌")

                            .setStyle(
                                ButtonStyle.Danger
                            )

                    )

            );

    }
      await interaction.reply({
        components: [
            await buildContainer()
        ],
        flags: MessageFlags.IsComponentsV2,
        ephemeral: true
    });

    const message = await interaction.fetchReply();

    const collector = message.createMessageComponentCollector({
        time: 300000
    });

    collector.on("collect", async i => {

        if (i.user.id !== interaction.user.id) {
            return i.reply({
                content: "❌ Ce panneau ne vous appartient pas.",
                ephemeral: true
            });
        }

        switch (i.customId) {

            case "customroles_prev": {

                if (page > 0)
                    page--;

                return i.update({
                    components: [
                        await buildContainer()
                    ]
                });

            }

            case "customroles_next": {

                if (page < getMaxPage() - 1)
                    page++;

                return i.update({
                    components: [
                        await buildContainer()
                    ]
                });

            }

            case "customroles_refresh": {

                roles = await CustomRole.find({
                    guildId: interaction.guild.id
                }).sort({
                    createdAt: 1
                });

                if (!roles.length) {

                    collector.stop();

                    return i.update({
                        content: "❌ Aucun rôle personnalisé.",
                        components: []
                    });

                }

                if (page >= getMaxPage())
                    page = getMaxPage() - 1;

                return i.update({
                    components: [
                        await buildContainer()
                    ]
                });

            }
  case "customroles_select": {

    const role = await CustomRole.findById(
        i.values[0]
    );

    if (!role) {

        return i.reply({
            content: "❌ Ce rôle personnalisé n'existe plus.",
            ephemeral: true
        });

    }

    const discordRole =
        interaction.guild.roles.cache.get(
            role.roleId
        );

    const owner =
        await interaction.client.users
            .fetch(role.userId)
            .catch(() => null);

    const members =
        discordRole
            ? [...discordRole.members.values()]
            : [];

    const memberList =
        members.length
            ? members
                .slice(0, 20)
                .map(
                    (m, index) =>
                        `**${index + 1}.** ${m.user.tag} (\`${m.id}\`)`
                )
                .join("\n")
            : "Aucun membre.";

    const created =
        role.createdAt
            ? `<t:${Math.floor(
                role.createdAt.getTime() / 1000
            )}:F>`
            : "Inconnue";

    const row = new ActionRowBuilder().addComponents(

    new ButtonBuilder()
        .setCustomId(`rename_${role._id}`)
        .setLabel("Renommer")
        .setEmoji("✏️")
        .setStyle(ButtonStyle.Primary),

    new ButtonBuilder()
        .setCustomId(`modify_${role._id}`)
        .setLabel("Modifier")
        .setEmoji("🎨")
        .setStyle(ButtonStyle.Secondary),

    new ButtonBuilder()
        .setCustomId(`transfer_${role._id}`)
        .setLabel("Transférer")
        .setEmoji("👑")
        .setStyle(ButtonStyle.Success),

    new ButtonBuilder()
        .setCustomId(`delete_${role._id}`)
        .setLabel("Supprimer")
        .setEmoji("🗑️")
        .setStyle(ButtonStyle.Danger)

);

return i.reply({

    ephemeral: true,

    embeds: [

        new EmbedBuilder()

            .setColor(role.color)

            .setTitle(`🎭 ${role.name}`)

            .setDescription(

`## Informations du rôle

🏷️ **Nom**
${role.name}

⌨️ **Commande**
\`+${role.commandName}\`

🎨 **Couleur**
\`${role.color}\`

🆔 **ID**
\`${role.roleId}\`

📅 **Création**
${created}

👤 **Propriétaire**
${owner
    ? `${owner.tag}\n\`${owner.id}\``
    : "Utilisateur introuvable"}

👥 **Nombre de membres**
${members.length}

🤝 **Partagé avec**
${role.sharedWith.length}

### Membres

${memberList}`

            )

    ],

    components: [row]

});
    }
 case "customroles_back": {

                collector.stop("back");

                return i.update({
                    content: "🏠 Retour au panneau principal...",
                    components: []
                });

            }

            case "customroles_close": {

                collector.stop("close");

                return i.update({
                    content: "✅ Panneau fermé.",
                    components: []
                });

            }

        }

    });

    collector.on("end", async (_, reason) => {

        if (
            reason === "close" ||
            reason === "back"
        ) return;

        try {

            await message.edit({
                components: []
            });

        } catch {}

    });
