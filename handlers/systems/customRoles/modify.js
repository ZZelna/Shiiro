const {
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    ActionRowBuilder
} = require("discord.js");

const CustomRole = require("../../../models/CustomRole");

const {
    HEX_REGEX,
    COMMAND_REGEX,
    RESERVED_COMMANDS
} = require("./constants");

const {
    commandExists
} = require("./utils");

module.exports = async interaction => {

    if (interaction.isButton()) {

        if (
            interaction.customId.startsWith("modify_")
        ) {
            return showModifyModal(interaction);
        }

    }

    if (interaction.isModalSubmit()) {

        if (
            interaction.customId.startsWith("modify_modal_")
        ) {
            return submitModify(interaction);
        }

    }

};

async function showModifyModal(interaction) {

    const roleId = interaction.customId.replace(
        "modify_",
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
            `modify_modal_${customRole._id}`
        )

        .setTitle("Modifier un rôle");

    const colorInput =
        new TextInputBuilder()

            .setCustomId("color")

            .setLabel("Couleur (#5865F2)")

            .setStyle(
                TextInputStyle.Short
            )

            .setRequired(true)

            .setValue(
                customRole.color
            );

    const iconInput =
        new TextInputBuilder()

            .setCustomId("icon")

            .setLabel("Emoji ou URL (optionnel)")

            .setStyle(
                TextInputStyle.Short
            )

            .setRequired(false)

            .setValue(
                customRole.icon || ""
            );

    const commandInput =
        new TextInputBuilder()

            .setCustomId("command")

            .setLabel("Nom de la commande")

            .setStyle(
                TextInputStyle.Short
            )

            .setRequired(true)

            .setMaxLength(20)

            .setValue(
                customRole.commandName
            );

    modal.addComponents(

        new ActionRowBuilder()

            .addComponents(colorInput),

        new ActionRowBuilder()

            .addComponents(iconInput),

        new ActionRowBuilder()

            .addComponents(commandInput)

    );

    return interaction.showModal(
        modal
    );

}
async function submitModify(interaction) {

    await interaction.deferReply({
        ephemeral: true
    });

    const roleId = interaction.customId.replace(
        "modify_modal_",
        ""
    );

    const customRole =
        await CustomRole.findById(roleId);

    if (!customRole) {

        return interaction.editReply(
            "❌ Ce rôle personnalisé n'existe plus."
        );

    }

    const rawColor = interaction.fields

        .getTextInputValue("color")

        .trim();

    const rawIcon = interaction.fields

        .getTextInputValue("icon")

        ?.trim() || null;

    const commandName = interaction.fields

        .getTextInputValue("command")

        .trim()

        .toLowerCase();

    if (!HEX_REGEX.test(rawColor)) {

        return interaction.editReply(
            "❌ Couleur invalide."
        );

    }

    if (!COMMAND_REGEX.test(commandName)) {

        return interaction.editReply(
            "❌ Nom de commande invalide."
        );

    }

    if (
        RESERVED_COMMANDS.includes(commandName)
    ) {

        return interaction.editReply(
            "❌ Cette commande est réservée."
        );

    }

    const exists = await commandExists(

        interaction.guild.id,

        commandName,

        customRole.userId

    );

    if (exists) {

        return interaction.editReply(
            `❌ La commande \`+${commandName}\` existe déjà.`
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

    const options = {

        color: parseInt(
            rawColor.replace("#", ""),
            16
        ),

        reason:
            `Modification par ${interaction.user.tag}`

    };

    const isImage =
        rawIcon &&
        /^https?:\/\//i.test(rawIcon);

    const isEmoji =
        rawIcon &&
        !isImage;

    if (isImage)
        options.icon = rawIcon;

    if (isEmoji)
        options.unicodeEmoji = rawIcon;

    try {

        await discordRole.edit(options);

    } catch (err) {

        if (isImage) {

            delete options.icon;

            try {

                await discordRole.edit(options);

                customRole.icon = null;

            } catch (e) {

                return interaction.editReply(
                    `❌ ${e.message}`
                );

            }

        } else {

            return interaction.editReply(
                `❌ ${err.message}`
            );

        }

    }

    customRole.color = rawColor;
    customRole.commandName = commandName;

    if (rawIcon)
        customRole.icon = rawIcon;

    customRole.updatedAt = new Date();

    await customRole.save();

    return interaction.editReply({

        embeds: [

            {

                color: parseInt(
                    rawColor.replace("#", ""),
                    16
                ),

                title: "🎨 Rôle modifié",

                description:

`Le rôle personnalisé **${customRole.name}** a été mis à jour.

🎨 **Couleur**
\`${rawColor}\`

😀 **Icône**
${rawIcon || "Aucune"}

⌨️ **Commande**
\`+${commandName}\``,

                timestamp: new Date()

            }

        ]

    });

}
