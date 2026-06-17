const { EmbedBuilder } = require("discord.js");

module.exports = async (oldState, newState) => {

    const logs =
        newState.guild.channels.cache.get(
            "1516868193761890384"
        );

    if (!logs) return;

    const member =
        newState.member;

    // JOIN

    if (
        !oldState.channel &&
        newState.channel
    ) {

        return logs.send({
            embeds: [
                new EmbedBuilder()
                    .setColor("Green")
                    .setTitle("🟢 Connexion Vocal")
                    .setDescription(
                        `${member} a rejoint **${newState.channel.name}**`
                    )
                    .setTimestamp()
            ]
        });

    }

    // LEAVE

    if (
        oldState.channel &&
        !newState.channel
    ) {

        return logs.send({
            embeds: [
                new EmbedBuilder()
                    .setColor("Red")
                    .setTitle("🔴 Déconnexion Vocal")
                    .setDescription(
                        `${member} a quitté **${oldState.channel.name}**`
                    )
                    .setTimestamp()
            ]
        });

    }

    // MOVE

    if (
        oldState.channel &&
        newState.channel &&
        oldState.channelId !== newState.channelId
    ) {

        await wait(1000);

        const moderator =
            await getModerator(
                newState.guild,
                member.id
            );

        return logs.send({
            embeds: [
                new EmbedBuilder()
                    .setColor("Blue")
                    .setTitle("🔊 Déplacement Vocal")
                    .addFields(
                        {
                            name: "👤 Utilisateur",
                            value: member.user.tag,
                            inline: true
                        },
                        {
                            name: "👮 Modérateur",
                            value: moderator
                                ? moderator.tag
                                : "Inconnu",
                            inline: true
                        },
                        {
                            name: "📍 Ancien salon",
                            value: oldState.channel.name,
                            inline: true
                        },
                        {
                            name: "📍 Nouveau salon",
                            value: newState.channel.name,
                            inline: true
                        }
                    )
                    .setThumbnail(
                        member.user.displayAvatarURL({
                            dynamic: true
                        })
                    )
                    .setTimestamp()
            ]
        });

    }

    // MUTE

    if (
        !oldState.serverMute &&
        newState.serverMute
    ) {

        await wait(1000);

        const moderator =
            await getModerator(
                newState.guild,
                member.id
            );

        return logs.send({
            embeds: [
                new EmbedBuilder()
                    .setColor("Orange")
                    .setTitle("🔇 Mute Vocal")
                    .addFields(
                        {
                            name: "👤 Utilisateur",
                            value: member.user.tag,
                            inline: true
                        },
                        {
                            name: "👮 Modérateur",
                            value: moderator
                                ? moderator.tag
                                : "Inconnu",
                            inline: true
                        }
                    )
                    .setTimestamp()
            ]
        });

    }

    // UNMUTE

    if (
        oldState.serverMute &&
        !newState.serverMute
    ) {

        await wait(1000);

        const moderator =
            await getModerator(
                newState.guild,
                member.id
            );

        return logs.send({
            embeds: [
                new EmbedBuilder()
                    .setColor("Green")
                    .setTitle("🔊 Unmute Vocal")
                    .addFields(
                        {
                            name: "👤 Utilisateur",
                            value: member.user.tag,
                            inline: true
                        },
                        {
                            name: "👮 Modérateur",
                            value: moderator
                                ? moderator.tag
                                : "Inconnu",
                            inline: true
                        }
                    )
                    .setTimestamp()
            ]
        });

    }

    // DEAF

    if (
        !oldState.serverDeaf &&
        newState.serverDeaf
    ) {

        await wait(1000);

        const moderator =
            await getModerator(
                newState.guild,
                member.id
            );

        return logs.send({
            embeds: [
                new EmbedBuilder()
                    .setColor("Orange")
                    .setTitle("🔈 Deaf Vocal")
                    .addFields(
                        {
                            name: "👤 Utilisateur",
                            value: member.user.tag,
                            inline: true
                        },
                        {
                            name: "👮 Modérateur",
                            value: moderator
                                ? moderator.tag
                                : "Inconnu",
                            inline: true
                        }
                    )
                    .setTimestamp()
            ]
        });

    }

    // UNDEAF

    if (
        oldState.serverDeaf &&
        !newState.serverDeaf
    ) {

        await wait(1000);

        const moderator =
            await getModerator(
                newState.guild,
                member.id
            );

        return logs.send({
            embeds: [
                new EmbedBuilder()
                    .setColor("Green")
                    .setTitle("🔊 Undeaf Vocal")
                    .addFields(
                        {
                            name: "👤 Utilisateur",
                            value: member.user.tag,
                            inline: true
                        },
                        {
                            name: "👮 Modérateur",
                            value: moderator
                                ? moderator.tag
                                : "Inconnu",
                            inline: true
                        }
                    )
                    .setTimestamp()
            ]
        });

    }

};

async function getModerator(
    guild,
    targetId
) {

    const fetchedLogs =
        await guild.fetchAuditLogs({
            limit: 10
        }).catch(() => null);

    if (!fetchedLogs) return null;

    const entry =
        fetchedLogs.entries.find(
            log =>
                log.target &&
                log.target.id === targetId
        );

    return entry
        ? entry.executor
        : null;

}

function wait(ms) {
    return new Promise(
        resolve =>
            setTimeout(resolve, ms)
    );
}
