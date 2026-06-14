const {
    ChannelType,
    PermissionFlagsBits,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");

const ticketConfig = require("../../commands/config/tickets.js");

module.exports = async (interaction) => {

    try {

        // =========================
        // CLAIM / UNCLAIM
        // =========================


        // =========================
        // CREATION TICKET
        // =========================

        if (!interaction.isStringSelectMenu()) return;
        if (interaction.customId !== "ticket_create") return;

        const ticketType = interaction.values[0];

        console.log("Ticket sélectionné :", ticketType);

        const config = ticketConfig[ticketType];

        if (!config) {
            return interaction.reply({
                content: "❌ Configuration du ticket introuvable.",
                ephemeral: true
            });
        }

        const permissions = [
            {
                id: interaction.guild.id,
                deny: [PermissionFlagsBits.ViewChannel]
            },
            {
                id: interaction.user.id,
                allow: [
                    PermissionFlagsBits.ViewChannel,
                    PermissionFlagsBits.SendMessages,
                    PermissionFlagsBits.ReadMessageHistory
                ]
            }
        ];

        for (const roleId of config.roles) {

            permissions.push({
                id: roleId,
                allow: [
                    PermissionFlagsBits.ViewChannel,
                    PermissionFlagsBits.SendMessages,
                    PermissionFlagsBits.ReadMessageHistory
                ]
            });

        }

        const channel = await interaction.guild.channels.create({
            name: `ticket-${interaction.user.username}`,
            type: ChannelType.GuildText,
            parent: config.category,
            permissionOverwrites: permissions
        });

        const embed = new EmbedBuilder()
            .setColor("#2B2D31")
            .setTitle("🎫 Ticket créé")
            .setDescription(
`Bonjour ${interaction.user},

Merci de détailler votre demande.

Un membre de l'équipe concernée va vous répondre prochainement.`
            );

 await channel.send({
    content: config.roles
        .map(id => `<@&${id}>`)
        .join(" "),
    embeds: [embed]
});

        await interaction.reply({
            content: `✅ Votre ticket a été créé : ${channel}`,
            ephemeral: true
        });

    } catch (error) {

        console.error("ERREUR TICKET :", error);

        if (
            !interaction.replied &&
            !interaction.deferred
        ) {
            await interaction.reply({
                content: "❌ Une erreur est survenue.",
                ephemeral: true
            }).catch(() => {});
        }
    }
};
