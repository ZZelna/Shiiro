const {
ModalBuilder,
TextInputBuilder,
TextInputStyle,
ActionRowBuilder
} = require("discord.js");

const fs = require("fs");
const path = require("path");

const configPath =
path.join(
__dirname,
"../../config.json"
);

module.exports = async (interaction) => {

if (!interaction.isButton())
    return;
if (
    interaction.customId ===
    "customrole_add"
) {
    const modal =
        new ModalBuilder()
        .setCustomId(
            "customrole_add_modal"
        )
        .setTitle(
            "Ajouter un rôle personnalisé"
        );
    const roleName =
        new TextInputBuilder()
        .setCustomId(
            "role_name"
        )
        .setLabel(
            "Nom de la commande"
        )
        .setStyle(
            TextInputStyle.Short
        )
        .setRequired(true);
    const roleId =
        new TextInputBuilder()
        .setCustomId(
            "role_id"
        )
        .setLabel(
            "ID du rôle"
        )
        .setStyle(
            TextInputStyle.Short
        )
        .setRequired(true);
    modal.addComponents(
        new ActionRowBuilder()
            .addComponents(roleName),
        new ActionRowBuilder()
            .addComponents(roleId)
    );
    return interaction.showModal(
        modal
    );
}

};
