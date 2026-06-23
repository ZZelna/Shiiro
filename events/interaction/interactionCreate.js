const {
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    ActionRowBuilder,
    StringSelectMenuBuilder,
    EmbedBuilder,
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");

const fs = require("fs");
const path = require("path");

const configPath = path.join(
    __dirname,
    "../../config.json"
);

module.exports = async (interaction) => {

    // =========================
    // BOUTONS
    // =========================
    if (interaction.isButton()) {

        // AJOUTER
        if (interaction.customId === "customrole_add") {

            const modal = new ModalBuilder()
                .setCustomId("customrole_add_modal")
                .setTitle("Ajouter un rôle personnalisé");

            const roleName = new TextInputBuilder()
                .setCustomId("role_name")
                .setLabel("Nom de la commande")
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

            const roleId = new TextInputBuilder()
                .setCustomId("role_id")
                .setLabel("ID du rôle")
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

            const ownerId = new TextInputBuilder()
                .setCustomId("owner_id")
                .setLabel("ID du propriétaire")
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

            modal.addComponents(
                new ActionRowBuilder().addComponents(roleName),
                new ActionRowBuilder().addComponents(roleId),
                new ActionRowBuilder().addComponents(ownerId)
            );

            return interaction.showModal(modal);
        }

        // SUPPRIMER
        if (interaction.customId === "customrole_remove") {

            const config = JSON.parse(
                fs.readFileSync(configPath, "utf8")
            );

            const roles =
                config.custom_roles || {};

            const commands =
                Object.keys(roles);

            if (!commands.length) {
                return interaction.reply({
                    content:
                        "❌ Aucun rôle personnalisé.",
                    ephemeral: true
                });
            }

            const menu =
                new StringSelectMenuBuilder()
                    .setCustomId(
                        "delete_custom_role"
                    )
                    .setPlaceholder(
                        "Choisir un rôle à supprimer"
                    )
                    .addOptions(
                        commands.map(cmd => ({
                            label: cmd,
                            value: cmd
                        }))
                    );

            return interaction.reply({
                content:
                    "🗑️ Choisissez un rôle :",
                components: [
                    new ActionRowBuilder()
                        .addComponents(menu)
                ],
                ephemeral: true
            });
        }

        // LISTE
        if (
    interaction.customId ===
    "customrole_list"
) {

    const config =
        JSON.parse(
            fs.readFileSync(
                configPath,
                "utf8"
            )
        );

    const roles =
        config.custom_roles || {};

    const commands =
        Object.entries(roles);

    if (!commands.length) {

        return interaction.reply({

            content:
                "❌ Aucun rôle personnalisé.",

            ephemeral: true

        });

    }

    const embed =
        new EmbedBuilder()

        .setTitle(
            "📋 Rôles personnalisés"
        )

        .setColor(
            0x5865F2
        )

        .setTimestamp();

    commands.forEach(
        ([cmd, data]) => {

            embed.addFields({

                name:
                    `+${cmd}`,

                value:
                    `👑 Propriétaire : <@${data.owner_id}>\n🎭 Rôle : <@&${data.role_id}>`,

                inline: false

            });

        }
    );

    return interaction.reply({

        embeds: [embed],

        ephemeral: true

    });

}
        if (interaction.customId === "casinohelp_page2") {

    const embed = new EmbedBuilder()
        .setColor("Gold")
        .setTitle("🎰 Casino Help • Page 2/4")
        .setDescription(`
## Commandes Admins Casino

• +gw
• +greroll
• +addcoins
• +delcoins
• +addgifts
• +delgifts
• +drop
• +renew
• +pingcasino
• +giveboosts
• +giverobs
`);

    const row = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId("casinohelp_page1")
                .setLabel("⬅️")
                .setStyle(ButtonStyle.Secondary),

            new ButtonBuilder()
                .setCustomId("casinohelp_page3")
                .setLabel("➡️")
                .setStyle(ButtonStyle.Primary)
        );

    return interaction.update({
        embeds: [embed],
        components: [row]
    });
}
        if (interaction.customId === "casinohelp_page3") {

    const embed = new EmbedBuilder()
        .setColor("Gold")
        .setTitle("🎰 Casino Help • Page 3/4")
        .setDescription(`
## Commandes Owners Casino

• +gend
• +panelcasino
• +shop
• +resetcasino
• +blacklistcasino
• +blacklist
• +weeklycasino
• +wl
• +wlremove
• +wllist
`);

    const row = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId("casinohelp_page2")
                .setLabel("⬅️")
                .setStyle(ButtonStyle.Secondary),

            new ButtonBuilder()
                .setCustomId("casinohelp_page4")
                .setLabel("➡️")
                .setStyle(ButtonStyle.Primary)
        );

    return interaction.update({
        embeds: [embed],
        components: [row]
    });
}
        if (interaction.customId === "casinohelp_page4") {

    const embed = new EmbedBuilder()
        .setColor("Gold")
        .setTitle("🎰 Casino Help • Page 4/4")
        .setDescription(`
## Commandes GDC Casino

• +clancreate
• +invite
• +leave
• +transfer
• +deleteclan
• +topclans
• +myclan
• +statsclan
`);

    const row = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId("casinohelp_page3")
                .setLabel("⬅️")
                .setStyle(ButtonStyle.Secondary)
        );

    return interaction.update({
        embeds: [embed],
        components: [row]
    });
}
        }
// =========================
// GIVEAWAYS
// =========================

const Giveaway = require("../../models/Giveaway");

if (interaction.isButton()) {

    if (interaction.customId.startsWith("gw_")) {

        const giveawayId =
            interaction.customId.replace("gw_", "");

        const giveaway =
            await Giveaway.findById(giveawayId);

        if (!giveaway) {

            return interaction.reply({
                content: "❌ Giveaway introuvable.",
                ephemeral: true
            });

        }

        if (giveaway.ended) {

            return interaction.reply({
                content: "❌ Ce giveaway est terminé.",
                ephemeral: true
            });

        }

        if (
            giveaway.participants.includes(
                interaction.user.id
            )
        ) {

            giveaway.participants =
                giveaway.participants.filter(
                    id => id !== interaction.user.id
                );

        } else {

            giveaway.participants.push(
                interaction.user.id
            );

        }

        await giveaway.save();

        const msg =
            await interaction.channel.messages.fetch(
                giveaway.messageId
            );

        const embed =
            EmbedBuilder.from(
                msg.embeds[0]
            );
const emoji =
    giveaway.type === "casino"
        ? "<:casino:1507449727266979922>"
        : "<:nitro:1508097922489647234>";
embed.setDescription(
`# Giveaway: ${giveaway.prize}

Cliquez sur le bouton ${emoji} pour participer
*Nombre de gagnants:* ${giveaway.winnersCount}

## Fin du giveaway
<t:${Math.floor(giveaway.endAt / 1000)}:R>`
);
        const row = new ActionRowBuilder()
.addComponents(
    new ButtonBuilder()
        .setCustomId(`gw_${giveaway._id}`)
        .setStyle(ButtonStyle.Secondary)
        .setEmoji(
            giveaway.type === "casino"
                ? "1507449727266979922"
                : "1508097922489647234"
        )
        .setLabel(
            String(giveaway.participants.length)
        )
);

await msg.edit({
    embeds: [embed],
    components: [row]
});

        return interaction.reply({
            content:
                giveaway.participants.includes(
                    interaction.user.id
                )
                    ? "✅ Participation enregistrée."
                    : "❌ Participation retirée.",
            ephemeral: true
        });

    }

}
    // =========================
    // MODAL
    // =========================
    if (interaction.isModalSubmit()) {

        if (
            interaction.customId ===
            "customrole_add_modal"
        ) {

            const commandName =
                interaction.fields.getTextInputValue(
                    "role_name"
                );

            const roleId =
                interaction.fields.getTextInputValue(
                    "role_id"
                );

            const ownerId =
                interaction.fields.getTextInputValue(
                    "owner_id"
                );

            const config = JSON.parse(
                fs.readFileSync(configPath, "utf8")
            );

            if (!config.custom_roles)
                config.custom_roles = {};

            config.custom_roles[
                commandName.toLowerCase()
            ] = {
                role_id: roleId,
                owner_id: ownerId
            };

            fs.writeFileSync(
                configPath,
                JSON.stringify(
                    config,
                    null,
                    2
                )
            );

            return interaction.reply({
                content:
                    `✅ Rôle personnalisé créé\n\n` +
                    `Commande : +${commandName}\n` +
                    `Rôle : ${roleId}\n` +
                    `Propriétaire : ${ownerId}`,
                ephemeral: true
            });
        }
    }

    // =========================
    // MENU DE SUPPRESSION
    // =========================
    if (interaction.isStringSelectMenu()) {

        if (
            interaction.customId ===
            "delete_custom_role"
        ) {

            const command =
                interaction.values[0];

            const config = JSON.parse(
                fs.readFileSync(configPath, "utf8")
            );

            delete config.custom_roles[
                command
            ];

            fs.writeFileSync(
                configPath,
                JSON.stringify(
                    config,
                    null,
                    2
                )
            );

            return interaction.update({
                content:
                    `✅ ${command} supprimé.`,
                components: []
            });
        }
    }
};
