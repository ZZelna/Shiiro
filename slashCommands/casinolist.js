const {
    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ComponentType
} = require("discord.js");

const CasinoProfile = require("../models/CasinoProfile");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("casinolist")
        .setDescription("Affiche tous les profils casino"),

    async execute(interaction) {

       const ROLE_ID = "1506674274826584284";

if (!interaction.member.roles.cache.has(ROLE_ID)) {
    return interaction.reply({
        content: "❌ Vous devez posséder le rôle autorisé pour utiliser cette commande.",
        ephemeral: true
    });
}

        const perPage = 25;
        const totalPages = Math.ceil(profiles.length / perPage);

        let page = 0;

        const generateEmbed = (page) => {
            const start = page * perPage;
            const end = start + perPage;

            const current = profiles.slice(start, end);

            const description = current
                .map((profile, index) => {
                    return `**${start + index + 1}.** <@${profile.userId}>
🆔 \`${profile.userId}\`
💴 **${(profile.yens ?? 0).toLocaleString("fr-FR")}** yens`;
                })
                .join("\n\n");

            return new EmbedBuilder()
                .setColor("Gold")
                .setTitle("🎰 Profils Casino")
                .setDescription(description)
                .setFooter({
                    text: `Page ${page + 1}/${totalPages} • ${profiles.length} profils`
                });
        };

        const row = () =>
            new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId("prev")
                    .setEmoji("◀️")
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(page === 0),

                new ButtonBuilder()
                    .setCustomId("next")
                    .setEmoji("▶️")
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(page === totalPages - 1)
            );

        const message = await interaction.reply({
            embeds: [generateEmbed(page)],
            components: totalPages > 1 ? [row()] : [],
            fetchReply: true
        });

        if (totalPages <= 1) return;

        const collector = message.createMessageComponentCollector({
            componentType: ComponentType.Button,
            time: 300000
        });

        collector.on("collect", async i => {

            if (i.user.id !== interaction.user.id) {
                return i.reply({
                    content: "❌ Seul l'auteur de la commande peut utiliser ces boutons.",
                    ephemeral: true
                });
            }

            if (i.customId === "prev") page--;
            if (i.customId === "next") page++;

            await i.update({
                embeds: [generateEmbed(page)],
                components: [row()]
            });
        });

        collector.on("end", async () => {
            try {
                await message.edit({
                    components: []
                });
            } catch {}
        });
    }
};
