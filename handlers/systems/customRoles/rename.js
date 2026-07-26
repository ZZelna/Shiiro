const {
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    ActionRowBuilder
} = require("discord.js");

const CustomRole = require("../../../models/CustomRole");

module.exports = async interaction => {

    if (interaction.isButton()) {

        if (
            interaction.customId.startsWith("rename_")
        ) {
            return showRenameModal(interaction);
        }

    }

    if (interaction.isModalSubmit()) {

        if (
            interaction.customId.startsWith("rename_modal_")
        ) {
            return submitRename(interaction);
        }

    }

};

async function showRenameModal(interaction) {

    const roleId = interaction.customId.replace(
        "rename_",
        ""
    );

    const customRole =
        await CustomRole.findById(roleId);

    if (!customRole) {

        return interaction.reply({

            content:
                "❌ Ce rôle personnalisé n'existe plus.",

            ephemeral: true

        });

    }

    const modal = new ModalBuilder()

        .setCustomId(
            `rename_modal_${customRole._id}`
        )

        .setTitle("Renommer un rôle");

    const input =
        new TextInputBuilder()

            .setCustomId("name")

            .setLabel("Nouveau nom")

            .setStyle(
                TextInputStyle.Short
            )

            .setRequired(true)

            .setMaxLength(100)

            .setValue(
                customRole.name
            );

    modal.addComponents(

        new ActionRowBuilder()

            .addComponents(input)

    );

    return interaction.showModal(
        modal
    );

}
async function submitRename(interaction) {

    await interaction.deferReply({
        ephemeral: true
    });

    const roleId = interaction.customId.replace(
        "rename_modal_",
        ""
    );

    const customRole =
        await CustomRole.findById(roleId);

    if (!customRole) {

        return interaction.editReply(
            "❌ Ce rôle personnalisé n'existe plus."
        );

    }

    const newName = interaction.fields

        .getTextInputValue("name")

        .trim();

    if (newName.length < 1) {

        return interaction.editReply(
            "❌ Nom invalide."
        );

    }

    if (newName.length > 100) {

        return interaction.editReply(
            "❌ Le nom est trop long."
        );

    }

    const discordRole =
        await interaction.guild.roles
            .fetch(customRole.roleId)
            .catch(() => null);

    if (!discordRole) {

        return interaction.editReply(
            "❌ Le rôle Discord est introuvable."
        );

    }
const oldName = discordRole.name;

  try {

        await discordRole.edit({

            name: newName,

            reason:
                `Renommé par ${interaction.user.tag}`

        });

    } catch (err) {

        return interaction.editReply(
            `❌ ${err.message}`
        );

    }

    customRole.name = newName;

    customRole.updatedAt = new Date();

    await customRole.save();

    return interaction.editReply({

        embeds: [

            {

                color: 0x57F287,

                title: "✏️ Rôle renommé",

                description:

`Le rôle personnalisé a été renommé avec succès.

🏷️ **Ancien nom**
${oldName}

✨ **Nouveau nom**
${newName}`,

                timestamp: new Date()

            }

        ]

    });

}
