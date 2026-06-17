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
        newState.member ||
        oldState.member;

    // JOIN

    if (
        !oldState.channel &&
        newState.channel
    ) {

        const embed =
            new EmbedBuilder()

            .setColor("#57F287")

            .setAuthor({
                name: member.user.tag,
                iconURL:
                    member.user.displayAvatarURL({
                        dynamic: true
                    })
            })

            .setTitle(
                "🎧 Modification des Membres d'un Vocal"
            )

            .setDescription(
`${member} a rejoint le salon vocal 🔊 **${newState.channel.name}**.`
            )

            .setThumbnail(
                member.user.displayAvatarURL({
                    dynamic: true
                })
            )

            .setTimestamp();

        return logs.send({
            embeds: [embed]
        });

    }

    // LEAVE

    if (
        oldState.channel &&
        !newState.channel
    ) {

        const embed =
            new EmbedBuilder()

            .setColor("#ED4245")

            .setAuthor({
                name: member.user.tag,
                iconURL:
                    member.user.displayAvatarURL({
                        dynamic: true
                    })
            })

            .setTitle(
                "🎧 Modification des Membres d'un Vocal"
            )

            .setDescription(
`${member} a quitté le salon vocal 🔊 **${oldState.channel.name}**.`
            )

            .setThumbnail(
                member.user.displayAvatarURL({
                    dynamic: true
                })
            )

            .setTimestamp();

        return logs.send({
            embeds: [embed]
        });

    }

    // MOVE

    if (
        oldState.channel &&
        newState.channel &&
        oldState.channelId !==
            newState.channelId
    ) {

        const fetched =
            await oldState.guild.fetchAuditLogs({
                limit: 1,
                type:
                    AuditLogEvent.MemberMove
            });

        const executor =
            fetched.entries.first()
                ?.executor;

        const embed =
            new EmbedBuilder()

            .setColor("#FEE75C")

            .setAuthor({
                name: member.user.tag,
                iconURL:
                    member.user.displayAvatarURL({
                        dynamic: true
                    })
            })

            .setTitle(
                "🎧 Déplacement Vocal"
            )

            .setDescription(
`${member} a été déplacé.

📥 Ancien salon :
🔊 **${oldState.channel.name}**

📤 Nouveau salon :
🔊 **${newState.channel.name}**

👮 Modérateur :
${executor ? executor.tag : "Inconnu"}`
            )

            .setThumbnail(
                member.user.displayAvatarURL({
                    dynamic: true
                })
            )

            .setTimestamp();

        return logs.send({
            embeds: [embed]
        });

    }

    // MUTE

    if (
        !oldState.serverMute &&
        newState.serverMute
    ) {

        const fetched =
            await oldState.guild.fetchAuditLogs({
                limit: 1,
                type:
                    AuditLogEvent.MemberUpdate
            });

        const executor =
            fetched.entries.first()
                ?.executor;

        const embed =
            new EmbedBuilder()

            .setColor("#ED4245")

            .setAuthor({
                name: member.user.tag,
                iconURL:
                    member.user.displayAvatarURL({
                        dynamic: true
                    })
            })

            .setTitle(
                "🔇 Mute Vocal"
            )

            .setDescription(
`${member} a été mute vocalement.

👮 Modérateur :
${executor ? executor.tag : "Inconnu"}`
            )

            .setThumbnail(
                member.user.displayAvatarURL({
                    dynamic: true
                })
            )

            .setTimestamp();

        return logs.send({
            embeds: [embed]
        });

    }

    // UNMUTE

    if (
        oldState.serverMute &&
        !newState.serverMute
    ) {

        const fetched =
            await oldState.guild.fetchAuditLogs({
                limit: 1,
                type:
                    AuditLogEvent.MemberUpdate
            });

        const executor =
            fetched.entries.first()
                ?.executor;

        const embed =
            new EmbedBuilder()

            .setColor("#57F287")

            .setAuthor({
                name: member.user.tag,
                iconURL:
                    member.user.displayAvatarURL({
                        dynamic: true
                    })
            })

            .setTitle(
                "🔈 Unmute Vocal"
            )

            .setDescription(
`${member} a été unmute vocalement.

👮 Modérateur :
${executor ? executor.tag : "Inconnu"}`
            )

            .setThumbnail(
                member.user.displayAvatarURL({
                    dynamic: true
                })
            )

            .setTimestamp();

        return logs.send({
            embeds: [embed]
        });

    }

    // DISCONNECT FORCE

    if (
        oldState.channel &&
        !newState.channel
    ) {

        const fetched =
            await oldState.guild.fetchAuditLogs({
                limit: 1,
                type:
                    AuditLogEvent.MemberDisconnect
            }).catch(() => null);

        const executor =
            fetched?.entries.first()
                ?.executor;

        if (!executor) return;

        const embed =
            new EmbedBuilder()

            .setColor("#ED4245")

            .setAuthor({
                name: member.user.tag,
                iconURL:
                    member.user.displayAvatarURL({
                        dynamic: true
                    })
            })

            .setTitle(
                "❌ Déconnexion Forcée"
            )

            .setDescription(
`${member} a été déconnecté du vocal.

👮 Modérateur :
${executor.tag}`
            )

            .setThumbnail(
                member.user.displayAvatarURL({
                    dynamic: true
                })
            )

            .setTimestamp();

        return logs.send({
            embeds: [embed]
        });

    }

};
