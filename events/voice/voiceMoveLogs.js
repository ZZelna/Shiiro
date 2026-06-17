const {
    EmbedBuilder,
    AuditLogEvent
} = require("discord.js");

module.exports = async (
    oldState,
    newState
) => {

    const logs =
        oldState.guild.channels.cache.get(
            "1516868193761890384"
        );

    if (!logs) return;

    const member =
        oldState.member;

    if (
        oldState.channel &&
        newState.channel &&
        oldState.channel.id !==
        newState.channel.id
    ) {

        let moderator =
            "Inconnu";

        try {

            const fetchedLogs =
                await oldState.guild.fetchAuditLogs({
                    limit: 10
                });

            const entry =
                fetchedLogs.entries.find(
                    log =>

                        log.target?.id ===
                        member.id &&

                        Date.now() -
                        log.createdTimestamp <
                        5000
                );

            if (
                entry?.executor
            ) {

                moderator =
                    `${entry.executor.tag}`;

            }

        } catch (err) {
            console.log(err);
        }

        const embed =
            new EmbedBuilder()

            .setColor(
                "#FEE75C"
            )

            .setAuthor({
                name:
                    `${member.user.username} (${member.id})`,
                iconURL:
                    member.user.displayAvatarURL({
                        dynamic: true
                    })
            })

            .setTitle(
                "🎧 Déplacement Vocal"
            )

            .addFields(
                {
                    name:
                        "👮 Modérateur",
                    value:
                        moderator,
                    inline:
                        false
                },
                {
                    name:
                        "👤 Utilisateur",
                    value:
                        member.user.tag,
                    inline:
                        false
                },
                {
                    name:
                        "📢 Ancien salon",
                    value:
                        oldState.channel.name,
                    inline:
                        true
                },
                {
                    name:
                        "📢 Nouveau salon",
                    value:
                        newState.channel.name,
                    inline:
                        true
                }
            )

            .setThumbnail(
                member.user.displayAvatarURL({
                    dynamic: true,
                    size: 512
                })
            )

            .setTimestamp();

        logs.send({
            embeds: [embed]
        });

    }

};
