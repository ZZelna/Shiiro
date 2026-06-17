const { EmbedBuilder } = require("discord.js");

module.exports = async (oldState, newState) => {

    const logs =
        oldState.guild.channels.cache.get(
            "1516868193761890384"
        );

    if (!logs) return;

    const member = oldState.member;

    // JOIN

    if (
        !oldState.channel &&
        newState.channel
    ) {

        const embed =
            new EmbedBuilder()

            .setColor("#57F287")

            .setAuthor({
                name: `${member.user.username} (${member.id})`,
                iconURL:
                    member.user.displayAvatarURL({
                        dynamic: true
                    })
            })

            .setTitle(
                "🎧 Modification des Membres d'un Vocal"
            )

            .setDescription(
                `${member} a rejoint le salon vocal ${newState.channel}.`
            )

            .setThumbnail(
                member.user.displayAvatarURL({
                    dynamic: true,
                    size: 512
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
                name: `${member.user.username} (${member.id})`,
                iconURL:
                    member.user.displayAvatarURL({
                        dynamic: true
                    })
            })

            .setTitle(
                "🎧 Modification des Membres d'un Vocal"
            )

            .setDescription(
                `${member} a quitté le salon vocal ${oldState.channel}.`
            )

            .setThumbnail(
                member.user.displayAvatarURL({
                    dynamic: true,
                    size: 512
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
        oldState.channel.id !==
        newState.channel.id
    ) {

        const embed =
            new EmbedBuilder()

            .setColor("#FEE75C")

            .setAuthor({
                name: `${member.user.username} (${member.id})`,
                iconURL:
                    member.user.displayAvatarURL({
                        dynamic: true
                    })
            })

            .setTitle(
                "🎧 Déplacement Vocal"
            )

            .setDescription(
                `${member} a été déplacé de ${oldState.channel} vers ${newState.channel}.`
            )

            .setThumbnail(
                member.user.displayAvatarURL({
                    dynamic: true,
                    size: 512
                })
            )

            .setTimestamp();

        return logs.send({
            embeds: [embed]
        });

    }

};
