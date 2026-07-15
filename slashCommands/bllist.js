const {
    SlashCommandBuilder,
    ContainerBuilder,
    TextDisplayBuilder,
    SeparatorBuilder,
    SeparatorSpacingSize,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    MessageFlags
} = require("discord.js");

const GlobalBlacklist =
require("../models/GlobalBlacklist");

const CHAR_BUDGET_PER_PAGE = 3600;

function buildPageContainer(pages, pageIndex, totalUsers, includeButtons = true) {
    const container = new ContainerBuilder()
        .setAccentColor(0xED4245)
        .addTextDisplayComponents(
            new TextDisplayBuilder().setContent("## ⛔ Blacklist Globale")
        )
        .addSeparatorComponents(
            new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
        );

    for (const block of pages[pageIndex]) {
        container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(block)
        );
    }

    container.addSeparatorComponents(
        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
    );

    container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
            `-# Page ${pageIndex + 1}/${pages.length} • ${totalUsers} utilisateur(s) blacklisté(s) au total`
        )
    );

    if (includeButtons) {
        container.addActionRowComponents(
            new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId("bllist_prev")
                    .setLabel("◀️ Précédent")
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(pageIndex === 0),
                new ButtonBuilder()
                    .setCustomId("bllist_next")
                    .setLabel("Suivant ▶️")
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(pageIndex === pages.length - 1)
            )
        );
    }

    return container;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName("bllist")
        .setDescription(
            "Afficher la blacklist globale"
        ),

    async execute(interaction) {

        const allowedRole =
        "1506674274826584284";

        if (
            !interaction.member.roles.cache.has(
                allowedRole
            )
        ) {

            return interaction.reply({
                content:
                "❌ Tu n'as pas la permission d'utiliser cette commande.",
                ephemeral: true
            });

        }

        const users =
        await GlobalBlacklist.find()
        .sort({
            createdAt: -1
        });

        if (!users.length) {

            return interaction.reply({
                content:
                "✅ Aucun utilisateur dans la blacklist globale.",
                ephemeral: true
            });

        }

        await interaction.deferReply({ ephemeral: true });

        // ─── Construit tous les blocs texte (un par entrée) ──────────────────
        const blocks = [];

        for (const entry of users) {

            const user =
            await interaction.client.users
            .fetch(entry.userId)
            .catch(() => null);

            const moderator =
            await interaction.client.users
            .fetch(entry.moderatorId)
            .catch(() => null);

            blocks.push(
                "```diff\n" +
                `- Blacklist Globale\n` +
                `Utilisateur: ${
                    user
                        ? user.tag
                        : "Utilisateur inconnu"
                } (ID: ${entry.userId})\n` +
                `Raison: ${entry.reason}\n` +
                `Modérateur: ${
                    moderator
                        ? moderator.tag
                        : "Inconnu"
                } (ID: ${entry.moderatorId})\n` +
                `Date: ${entry.createdAt.toLocaleDateString("fr-FR")}\n` +
                "```"
            );
        }

        // ─── Découpe les blocs en pages selon le budget de caractères ────────
        const pages = [];
        let currentPage = [];
        let currentLength = 0;

        for (const block of blocks) {
            if (currentLength + block.length > CHAR_BUDGET_PER_PAGE && currentPage.length > 0) {
                pages.push(currentPage);
                currentPage = [];
                currentLength = 0;
            }
            currentPage.push(block);
            currentLength += block.length;
        }
        if (currentPage.length > 0) pages.push(currentPage);

        let pageIndex = 0;

        const msg = await interaction.editReply({
            components: [buildPageContainer(pages, pageIndex, users.length)],
            flags: MessageFlags.IsComponentsV2
        });

        // Si une seule page, pas besoin de collector
        if (pages.length <= 1) return;

        const collector = msg.createMessageComponentCollector({
            filter: i => i.user.id === interaction.user.id &&
                ["bllist_prev", "bllist_next"].includes(i.customId),
            time: 5 * 60 * 1000
        });

        collector.on("collect", async (i) => {
            if (i.customId === "bllist_prev") pageIndex = Math.max(0, pageIndex - 1);
            if (i.customId === "bllist_next") pageIndex = Math.min(pages.length - 1, pageIndex + 1);

            await i.update({
                components: [buildPageContainer(pages, pageIndex, users.length)],
                flags: MessageFlags.IsComponentsV2
            });
        });

        collector.on("end", async () => {
            // Retire les boutons une fois le temps écoulé
            await interaction.editReply({
                components: [buildPageContainer(pages, pageIndex, users.length, false)],
                flags: MessageFlags.IsComponentsV2
            }).catch(() => {});
        });

    }
};
