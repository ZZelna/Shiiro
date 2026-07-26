const {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder
} = require("discord.js");

const CustomRole = require("../../../models/CustomRole");

module.exports = async interaction => {

    if (!interaction.isButton())
        return;

    const id = interaction.customId;

    if (id.startsWith("delete_"))
        return handleDelete(interaction);

    if (id.startsWith("delete_confirm_"))
        return confirmDelete(interaction);

    if (id.startsWith("delete_cancel_"))
        return cancelDelete(interaction);

};

async function handleDelete(interaction) {

    const roleId = interaction.customId.replace(
        "delete_",
        ""
    );

    const role = await CustomRole.findById(roleId);

    if (!role) {

        return interaction.reply({

            content:
                "❌ Ce rôle personnalisé n'existe plus.",

            ephemeral: true

        });

    }

    const embed = new EmbedBuilder()

        .setColor("#E74C3C")

        .setTitle("🗑️ Supprimer un rôle")

        .setDescription(

`Êtes-vous sûr de vouloir supprimer définitivement le rôle personnalisé **${role.name}** ?

⚠️ Cette action est **irréversible**.

Le rôle sera retiré de tous les membres et supprimé de la base de données.`

        );

    const row = new ActionRowBuilder()

        .addComponents(

            new ButtonBuilder()

                .setCustomId(
                    `delete_confirm_${role._id}`
                )

                .setLabel("Supprimer")

                .setEmoji("🗑️")

                .setStyle(ButtonStyle.Danger),

            new ButtonBuilder()

                .setCustomId(
                    `delete_cancel_${role._id}`
                )

                .setLabel("Annuler")

                .setEmoji("❌")

                .setStyle(ButtonStyle.Secondary)

        );

    return interaction.reply({

        embeds: [embed],

        components: [row],

        ephemeral: true

    });

}
async function cancelDelete(interaction) {

    return interaction.update({

        embeds: [

            new EmbedBuilder()

                .setColor("#95A5A6")

                .setTitle("❌ Suppression annulée")

                .setDescription(
                    "Le rôle personnalisé n'a pas été supprimé."
                )

        ],

        components: []

    });

}

async function confirmDelete(interaction) {

    const roleId = interaction.customId.replace(
        "delete_confirm_",
        ""
    );

    const customRole =
        await CustomRole.findById(roleId);

    if (!customRole) {

        return interaction.update({

            content:
                "❌ Ce rôle personnalisé n'existe plus.",

            embeds: [],

            components: []

        });

    }

    const discordRole =
        await interaction.guild.roles
            .fetch(customRole.roleId)
            .catch(() => null);

    let removedMembers = 0;

    if (discordRole) {

        removedMembers =
            discordRole.members.size;

        try {

            await discordRole.delete(
                `Suppression par ${interaction.user.tag}`
            );

        } catch (err) {

            return interaction.reply({

                content:
                    `❌ Impossible de supprimer le rôle.\n\n${err.message}`,

                ephemeral: true

            });

        }

    }

    await CustomRole.deleteOne({

        _id: customRole._id

    });

    return interaction.update({

        embeds: [

            new EmbedBuilder()

                .setColor("#2ECC71")

                .setTitle("✅ Rôle supprimé")

                .setDescription(

`Le rôle personnalisé **${customRole.name}** a été supprimé.

👥 Membres affectés : **${removedMembers}**

🗑️ Entrée supprimée de la base de données.`

                )

        ],

        components: []

    });

}
