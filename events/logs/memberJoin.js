const {
    EmbedBuilder
} = require("discord.js");

module.exports = async (member) => {

    const logs =
        member.guild.channels.cache.get(
            "1516880006075383909"
        );

    if (!logs) return;

    const embed =
        new EmbedBuilder()

        .setColor("#57F287")

        .setAuthor({
            name:
                `${member.user.tag} (${member.id})`,
            iconURL:
                member.user.displayAvatarURL({
                    dynamic: true
                })
        })

        .setTitle(
            "🟢 Arrivée d'un membre"
        )

        .setDescription(
            `${member} a rejoint le serveur.`
        )

        .addFields(
            {
                name: "👤 Utilisateur",
                value:
                    member.user.tag,
                inline: true
            },
            {
                name: "🆔 ID",
                value:
                    member.id,
                inline: true
            },
            {
                name:
                    "📅 Compte créé",
                value:
                    `<t:${Math.floor(member.user.createdTimestamp / 1000)}:F>`
            }
        )

        .setThumbnail(
            member.user.displayAvatarURL({
                dynamic: true,
                size: 1024
            })
        )

        .setTimestamp();

    logs.send({
        embeds: [embed]
    });

};
