const { EmbedBuilder } = require("discord.js");

module.exports = async (oldState, newState) => {

    const logs =
        newState.guild.channels.cache.get(
            "1516868193761890384"
        );

    if (!logs) return;

    if (
        oldState.channelId ===
        newState.channelId
    ) return;

    if (
        !oldState.channel ||
        !newState.channel
    ) return;

    const embed =
        new EmbedBuilder()

        .setColor("Blue")

        .setTitle(
            "🔊 Déplacement Vocal"
        )

        .setDescription(
            `${newState.member} a été déplacé`
        )

        .addFields(
            {
                name: "📍 Ancien salon",
                value:
                    oldState.channel.name,
                inline: true
            },
            {
                name: "📍 Nouveau salon",
                value:
                    newState.channel.name,
                inline: true
            }
        )

        .setThumbnail(
            newState.member.user.displayAvatarURL({
                dynamic: true
            })
        )

        .setTimestamp();

    logs.send({
        embeds: [embed]
    });

};
