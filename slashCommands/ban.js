const {
SlashCommandBuilder,
EmbedBuilder
} = require("discord.js");

const allowedRoles = [
"1506674274826584284",
"1507082580414173234",
"1506678694352261301"
];

module.exports = {
data: new SlashCommandBuilder()
.setName("ban")
.setDescription("Bannir un membre")
.addUserOption(option =>
option
.setName("membre")
.setDescription("Membre à bannir")
.setRequired(true)
)
.addStringOption(option =>
option
.setName("raison")
.setDescription("Raison du bannissement")
.setRequired(true)
),
async execute(interaction) {

    const hasPermission =
        interaction.member.roles.cache.some(role =>
            allowedRoles.includes(role.id)
        );

    if (!hasPermission) {
        return interaction.reply({
            content: "❌ Vous n'avez pas la permission d'utiliser cette commande.",
            ephemeral: true
        });
    }

    const member =
        interaction.options.getMember("membre");

    const reason =
        interaction.options.getString("raison");

    if (!member) {
        return interaction.reply({
            content: "❌ Membre introuvable.",
            ephemeral: true
        });
    }

    if (member.id === interaction.user.id) {
        return interaction.reply({
            content: "❌ Vous ne pouvez pas vous bannir vous-même.",
            ephemeral: true
        });
    }

    if (
        member.roles.highest.position >=
        interaction.member.roles.highest.position
    ) {
        return interaction.reply({
            content: "❌ Vous ne pouvez pas bannir un membre ayant un rôle supérieur ou égal au vôtre.",
            ephemeral: true
        });
    }

    try {

        await member.send(
`🔨 Tu as été banni du serveur **${interaction.guild.name}**

📋 Raison :
${reason}

🔓 Serveur d'unban :
https://discord.gg/FZqjCqMmXY

Merci de créer un ticket sur le serveur d'unban afin qu'un juge puisse examiner ta demande.`
).catch(() => {});
        
      await member.ban({
            reason: `${reason} | Ban par ${interaction.user.tag}`
        });

        const embed = new EmbedBuilder()
            .setColor("#ED4245")
            .setTitle("🔨 Bannissement effectué")
            .setThumbnail(
                member.user.displayAvatarURL({
                    dynamic: true
                })
            )
            .addFields(
                {
                    name: "👤 Utilisateur",
                    value: member.user.tag,
                    inline: true
                },
                {
                    name: "📋 Raison",
                    value: reason,
                    inline: true
                },
                {
                    name: "🛡️ Juge",
                    value: interaction.user.tag,
                    inline: true
                }
            )
            .setTimestamp();

        await interaction.reply({
            embeds: [embed]
        });

    } catch (err) {

        console.error(err);

        return interaction.reply({
            content: "❌ Impossible de bannir ce membre.",
            ephemeral: true
        });
    }
}
  };
