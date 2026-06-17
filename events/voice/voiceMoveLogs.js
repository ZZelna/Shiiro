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

        logs.send({
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

        logs.send({
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
        oldState.channelId !==
        newState.channelId
    ) {

        logs.send({
            embeds: [
                new EmbedBuilder()
                .setColor("Blue")
                .setTitle("🔊 Déplacement Vocal")
                .setDescription(
                    `${member} a été déplacé`
                )
                .addFields(
                    {
                        name: "Avant",
                        value: oldState.channel.name,
                        inline: true
                    },
                    {
                        name: "Après",
                        value: newState.channel.name,
                        inline: true
                    }
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

        logs.send({
            embeds: [
                new EmbedBuilder()
                .setColor("Orange")
                .setTitle("🔇 Mute Vocal")
                .setDescription(
                    `${member} a été mute`
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

        logs.send({
            embeds: [
                new EmbedBuilder()
                .setColor("Green")
                .setTitle("🔊 Unmute Vocal")
                .setDescription(
                    `${member} a été unmute`
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

        logs.send({
            embeds: [
                new EmbedBuilder()
                .setColor("Orange")
                .setTitle("🔈 Deaf Vocal")
                .setDescription(
                    `${member} a été deaf`
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

        logs.send({
            embeds: [
                new EmbedBuilder()
                .setColor("Green")
                .setTitle("🔊 Undeaf Vocal")
                .setDescription(
                    `${member} n'est plus deaf`
                )
                .setTimestamp()
            ]
        });

    }

    // STREAM

    if (
        !oldState.streaming &&
        newState.streaming
    ) {

        logs.send({
            embeds: [
                new EmbedBuilder()
                .setColor("Purple")
                .setTitle("🖥️ Stream démarré")
                .setDescription(
                    `${member} a commencé un partage d'écran`
                )
                .setTimestamp()
            ]
        });

    }

    if (
        oldState.streaming &&
        !newState.streaming
    ) {

        logs.send({
            embeds: [
                new EmbedBuilder()
                .setColor("Purple")
                .setTitle("🖥️ Stream arrêté")
                .setDescription(
                    `${member} a arrêté son partage d'écran`
                )
                .setTimestamp()
            ]
        });

    }

};
