const {
    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");

const Clan =
require("../models/Clan");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("deleteclan")
        .setDescription(
            "Supprimer définitivement votre clan"
        ),

    async execute(interaction) {

        const clan =
        await Clan.findOne({
            ownerId:
            interaction.user.id
        });

        if (!clan) {

            return interaction.reply({
                content:
                "❌ Tu n'es pas chef d'un clan.",
                ephemeral: true
            });

        }

        const embed =
        new EmbedBuilder()
            .setColor("Red")
            .setTitle(
                "⚠️ Confirmation"
            )
            .setDescription(
`Tu es sur le point de supprimer définitivement le clan **${clan.name}**.

Cette action est irréversible.`
            );

        const row =
        new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(
                        `deleteclan_confirm_${clan._id}`
                    )
                    .setLabel(
                        "✅ Confirmer"
                    )
                    .setStyle(
                        ButtonStyle.Danger
                    ),

                new ButtonBuilder()
                    .setCustomId(
                        `deleteclan_cancel_${clan._id}`
                    )
                    .setLabel(
                        "❌ Annuler"
                    )
                    .setStyle(
                        ButtonStyle.Secondary
                    )
            );

        return interaction.reply({
            embeds: [embed],
            components: [row],
            ephemeral: true
        });

    }
};
