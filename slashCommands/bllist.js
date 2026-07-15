const {
    SlashCommandBuilder,
    ContainerBuilder,
    TextDisplayBuilder,
    SeparatorBuilder,
    SeparatorSpacingSize,
    MessageFlags
} = require("discord.js");

const GlobalBlacklist =
require("../models/GlobalBlacklist");

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

        const container = new ContainerBuilder()
            .setAccentColor(0xED4245)
            .addTextDisplayComponents(
                new TextDisplayBuilder().setContent("## ⛔ Blacklist Globale")
            )
            .addSeparatorComponents(
                new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
            );

        // ─── Budget de caractères pour éviter de dépasser la limite V2 (~4000) ─
        const CHAR_BUDGET = 3600;
        let usedChars = 0;
        let shownCount = 0;

        for (const entry of users) {

            const user =
            await interaction.client.users
            .fetch(entry.userId)
            .catch(() => null);

            const moderator =
            await interaction.client.users
            .fetch(entry.moderatorId)
            .catch(() => null);

            const block =
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
            "```";

            if (usedChars + block.length > CHAR_BUDGET) break;

            container.addTextDisplayComponents(
                new TextDisplayBuilder().setContent(block)
            );

            usedChars += block.length;
            shownCount++;
        }

        container.addSeparatorComponents(
            new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
        );

        const remaining = users.length - shownCount;

        container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
                `-# ${users.length} utilisateur(s) blacklisté(s) au total` +
                (remaining > 0 ? ` • ${remaining} non affiché(s) (limite de taille atteinte)` : "")
            )
        );

        return interaction.editReply({
            components: [container],
            flags: MessageFlags.IsComponentsV2
        });

    }
};
