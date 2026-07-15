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

const CHAR_BUDGET_PER_PAGE = 3600;

const allowedRoles = [
    "1506674274826584284",
    "1507082580414173234",
    "1521595694052409485"
];

function buildPageContainer(pages, pageIndex, totalBans, includeButtons = true) {
    const container = new ContainerBuilder()
        .setAccentColor(0xED4245)
        .addTextDisplayComponents(
            new TextDisplayBuilder().setContent("## 🔨 Liste des bannis")
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
            `-# Page ${pageIndex + 1}/${pages.length} • ${totalBans} membre(s) banni(s) au total`
        )
    );

    if (includeButtons) {
        container.addActionRowComponents(
            new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId("banlist_prev")
                    .setLabel("◀️ Précédent")
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(pageIndex === 0),
                new ButtonBuilder()
                    .setCustomId("banlist_next")
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
        .setName("banlist")
        .setDescription("Affiche la liste des membres bannis du serveur"),

    async execute(interaction) {

        const hasPermission =
            interaction.member.roles.cache.some(role =>
                allowedRoles.includes(role.id)
            );

        if (!hasPermission) {
            return interaction.reply({
                content: "❌ Tu n'as pas la permission d'utiliser cette commande.",
                ephemeral: true
            });
        }

        await interaction.deferReply({ ephemeral: true });

        const bans = await interaction.guild.bans.fetch();

        if (!bans.size) {
            return interaction.editReply({
                content: "✅ Aucun membre banni sur ce serveur."
            });
        }

        // ─── Construit un bloc texte par membre banni ────────────────────────
        const blocks = [];

        for (const ban of bans.values()) {
            blocks.push(
                "```diff\n" +
                `- Membre banni\n` +
                `Utilisateur: ${ban.user.tag} (ID: ${ban.user.id})\n` +
                `Raison: ${ban.reason || "Aucune raison renseignée"}\n` +
                "```"
            );
        }

        // ─── Découpe en pages selon le budget de caractères ───────────────────
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
            components: [buildPageContainer(pages, pageIndex, bans.size)],
            flags: MessageFlags.IsComponentsV2
        });

        if (pages.length <= 1) return;

        const collector = msg.createMessageComponentCollector({
            filter: i => i.user.id === interaction.user.id &&
                ["banlist_prev", "banlist_next"].includes(i.customId),
            time: 5 * 60 * 1000
        });

        collector.on("collect", async (i) => {
            if (i.customId === "banlist_prev") pageIndex = Math.max(0, pageIndex - 1);
            if (i.customId === "banlist_next") pageIndex = Math.min(pages.length - 1, pageIndex + 1);

            await i.update({
                components: [buildPageContainer(pages, pageIndex, bans.size)],
                flags: MessageFlags.IsComponentsV2
            });
        });

        collector.on("end", async () => {
            await interaction.editReply({
                components: [buildPageContainer(pages, pageIndex, bans.size, false)],
                flags: MessageFlags.IsComponentsV2
            }).catch(() => {});
        });

    }
};
