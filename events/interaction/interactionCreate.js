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
    const ownerId =
    new TextInputBuilder()

    .setCustomId(
        "owner_id"
    )

    .setLabel(
        "ID du propriétaire"
    )

    .setStyle(
        TextInputStyle.Short
    )

    .setRequired(true);
modal.addComponents(

    new ActionRowBuilder()
        .addComponents(roleName),

    new ActionRowBuilder()
        .addComponents(roleId),

    new ActionRowBuilder()
        .addComponents(ownerId)

);
    return interaction.showModal(
        modal
    );
}
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

        const config =
            JSON.parse(
                fs.readFileSync(
                    configPath,
                    "utf8"
                )
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
};
