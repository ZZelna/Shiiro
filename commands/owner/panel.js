const {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");

const config =
    require("../../config.json");

module.exports = {

    name: "panel",

    async run(message) {

        if (
            !config.owner_ids.includes(
                message.author.id
            )
        ) {
            return;
        }

        const embed =
            new EmbedBuilder()

            .setColor("Blue")

            .setTitle(
                "⚙️ Gestion des rôles personnalisés"
            )

            .setDescription(
                "Utilisez les boutons ci-dessous."
            );

        const row =
            new ActionRowBuilder()

            .addComponents(

                new ButtonBuilder()
                    .setCustomId(
                        "customrole_add"
                    )
                    .setLabel(
                        "➕ Ajouter"
                    )
                    .setStyle(
                        ButtonStyle.Success
                    ),

                new ButtonBuilder()
                    .setCustomId(
                        "customrole_remove"
                    )
                    .setLabel(
                        "🗑️ Supprimer"
                    )
                    .setStyle(
                        ButtonStyle.Danger
                    ),

                new ButtonBuilder()
                    .setCustomId(
                        "customrole_list"
                    )
                    .setLabel(
                        "📋 Liste"
                    )
                    .setStyle(
                        ButtonStyle.Primary
                    )

            );

        await message.reply({
            embeds: [embed],
            components: [row]
        });

    }
}
