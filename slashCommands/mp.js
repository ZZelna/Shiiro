const {
    SlashCommandBuilder
} = require("discord.js");

const allowedRoles = [
    "1506674274826584284"
];

module.exports = {
    data: new SlashCommandBuilder()
        .setName("mp")
        .setDescription("Envoyer un message privé à un membre ou à un rôle.")

        .addStringOption(option =>
            option
                .setName("message")
                .setDescription("Le message à envoyer")
                .setRequired(true)
        )

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
        ),

    async execute(interaction) {

        const hasPermission = interaction.member.roles.cache.some(role =>
            allowedRoles.includes(role.id)
        );

        if (!hasPermission) {
            return interaction.reply({
                content: "❌ Vous n'avez pas la permission d'utiliser cette commande.",
                ephemeral: true
            });
        }

        const message = interaction.options.getString("message");
        const member = interaction.options.getUser("membre");
        const role = interaction.options.getRole("role");

        if (!member && !role) {
            return interaction.reply({
                content: "❌ Tu dois sélectionner un membre ou un rôle.",
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

        await interaction.deferReply({ ephemeral: true });

        const members = await interaction.guild.members.fetch();

        let success = 0;
        let failed = 0;

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

        return interaction.editReply({
            content:
`✅ Envoi terminé.

📨 Messages envoyés : **${success}**
❌ Échecs : **${failed}**`
        });

    }
};
