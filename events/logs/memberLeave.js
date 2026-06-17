const {
    EmbedBuilder
} = require("discord.js");

module.exports = async (member) => {

    const logs =
        member.guild.channels.cache.get(
            "1516880092725248160"
        );

    if (!logs) return;

    const embed =
        new EmbedBuilder()

        .setColor("#ED4245")

        .setAuthor({
            name:
                `${member.user.tag} (${member.id})`,
            iconURL:
                member.user.displayAvatarURL({
                    dynamic: true
                })
        })

        .setTitle(
            "🔴 Départ d'un membre"
        )

        .setDescription(
            `${member.user.tag} a quitté le serveur.`
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
