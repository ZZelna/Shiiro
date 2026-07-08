const {
    SlashCommandBuilder,
    PermissionFlagsBits
} = require("discord.js");

const config = require("../config.json");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("mp")
        .setDescription("Envoyer un message privé à un membre ou à un rôle.")
        .addUserOption(option =>
            option
                .setName("membre")
                .setDescription("Le membre à qui envoyer le message")
                .setRequired(false)
        )
        .addRoleOption(option =>
            option
                .setName("role")
                .setDescription("Le rôle à qui envoyer le message")
                .setRequired(false)
        )
        .addStringOption(option =>
            option
                .setName("message")
                .setDescription("Le message à envoyer")
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {

        if (!config.owner_ids.includes(interaction.user.id)) {
            return interaction.reply({
                content: "❌ Cette commande est réservée aux owners.",
                ephemeral: true
            });
        }

        const member = interaction.options.getUser("membre");
        const role = interaction.options.getRole("role");
        const message = interaction.options.getString("message");

        if (!member && !role) {
            return interaction.reply({
                content: "❌ Tu dois choisir un membre ou un rôle.",
                ephemeral: true
            });
        }

        if (member && role) {
            return interaction.reply({
                content: "❌ Tu ne peux sélectionner qu'un membre ou un rôle.",
                ephemeral: true
            });
        }

        if (member) {

            try {
                await member.send(message);

                return interaction.reply({
                    content: `✅ Message envoyé à **${member.tag}**.`,
                    ephemeral: true
                });

            } catch {

                return interaction.reply({
                    content: "❌ Impossible d'envoyer un message privé à ce membre.",
                    ephemeral: true
                });

            }

        }

        await interaction.deferReply({
            ephemeral: true
        });

        let success = 0;
        let failed = 0;

        const members = await interaction.guild.members.fetch();

        for (const guildMember of members.values()) {

            if (!guildMember.roles.cache.has(role.id)) continue;
            if (guildMember.user.bot) continue;

            try {

                await guildMember.send(message);
                success++;

            } catch {

                failed++;

            }

        }

        return interaction.editReply(
            `✅ Envoi terminé.\n\n📨 Messages envoyés : **${success}**\n❌ Échecs : **${failed}**`
        );

    }
};
