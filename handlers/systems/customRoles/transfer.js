const {
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    ActionRowBuilder,
    EmbedBuilder
} = require("discord.js");

const CustomRole = require("../../../models/CustomRole");

module.exports = async interaction => {

    if (interaction.isButton()) {

        if (
            interaction.customId.startsWith("transfer_")
        ) {
            return showTransferModal(interaction);
        }

    }

    if (interaction.isModalSubmit()) {

        if (
            interaction.customId.startsWith("transfer_modal_")
        ) {
            return submitTransfer(interaction);
        }

    }

};

async function showTransferModal(interaction) {

    const roleId = interaction.customId.replace(
        "transfer_",
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
            `transfer_modal_${customRole._id}`
        )

        .setTitle("Transférer un rôle");

    const userInput =
        new TextInputBuilder()

            .setCustomId("user")

            .setLabel(
                "ID ou mention du nouveau propriétaire"
            )

            .setPlaceholder(
                "123456789012345678"
            )

            .setStyle(
                TextInputStyle.Short
            )

            .setRequired(true);

    modal.addComponents(

        new ActionRowBuilder()

            .addComponents(userInput)

    );

    return interaction.showModal(
        modal
    );

}
async function submitTransfer(interaction) {

    await interaction.deferReply({
        ephemeral: true
    });

    const roleId = interaction.customId.replace(
        "transfer_modal_",
        ""
    );

    const customRole =
        await CustomRole.findById(roleId);

    if (!customRole) {

        return interaction.editReply(
            "❌ Ce rôle personnalisé n'existe plus."
        );

    }

    const input = interaction.fields

        .getTextInputValue("user")

        .trim();

    const userId = input

        .replace(/[<@!>]/g, "");

    const member =
        await interaction.guild.members
            .fetch(userId)
            .catch(() => null);

    if (!member) {

        return interaction.editReply(
            "❌ Utilisateur introuvable."
        );

    }

    if (member.user.bot) {

        return interaction.editReply(
            "❌ Impossible de transférer un rôle à un bot."
        );

    }

    if (member.id === customRole.userId) {

        return interaction.editReply(
            "❌ Cet utilisateur possède déjà ce rôle."
        );

    }

    const alreadyOwns =
        await CustomRole.findOne({

            guildId: interaction.guild.id,

            userId: member.id

        });

    if (alreadyOwns) {

        return interaction.editReply(

            "❌ Cet utilisateur possède déjà un rôle personnalisé."

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

    const oldOwner =
        await interaction.guild.members
            .fetch(customRole.userId)
            .catch(() => null);

    try {

        if (oldOwner)
            await oldOwner.roles.remove(discordRole);

        await member.roles.add(discordRole);

    } catch (err) {

        return interaction.editReply(
            `❌ ${err.message}`
        );

    }

    const oldId = customRole.userId;

    customRole.userId = member.id;

    customRole.updatedAt = new Date();

    await customRole.save();

    return interaction.editReply({

        embeds: [

            new EmbedBuilder()

                .setColor(0x57F287)

                .setTitle("👑 Rôle transféré")

                .setDescription(

`Le rôle personnalisé **${customRole.name}** a été transféré.

👤 **Ancien propriétaire**
<@${oldId}>

👑 **Nouveau propriétaire**
${member}

🆔 **ID**
\`${member.id}\``

                )

                .setTimestamp()

        ]

    });

}
