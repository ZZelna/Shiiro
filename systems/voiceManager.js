const {
    ChannelType,
    PermissionFlagsBits
} = require("discord.js");

const VoiceChannel = require("../models/VoiceChannel");
const config = require("../config/voiceConfig");

async function createVoice(member) {

    const guild = member.guild;

    const channel = await guild.channels.create({

        name: `${config.channelPrefix}${member.displayName}`,

        type: ChannelType.GuildVoice,

        parent: config.categoryId,

        permissionOverwrites: [
            {
                id: guild.id,
                allow: [
                    PermissionFlagsBits.Connect,
                    PermissionFlagsBits.ViewChannel
                ]
            }
        ]

    });

    await member.voice.setChannel(channel);

    await VoiceChannel.create({

        guildId: guild.id,

        channelId: channel.id,

        ownerId: member.id

    });

    return channel;

}

async function deleteVoice(channel) {

    if (!channel) return;

    const data = await VoiceChannel.findOne({
        channelId: channel.id
    });

    // Ce n'est pas un vocal temporaire
    if (!data) return;

    // Il y a encore quelqu'un dedans
    if (channel.members.size > 0) return;

    setTimeout(async () => {

        const refreshed = channel.guild.channels.cache.get(channel.id);

        // Le salon a déjà été supprimé
        if (!refreshed) return;

        // Quelqu'un est revenu entre-temps
        if (refreshed.members.size > 0) return;

        await VoiceChannel.deleteOne({
            channelId: refreshed.id
        });

        await refreshed.delete().catch(() => {});

    }, config.deleteDelay);

}

module.exports = {

    createVoice,
    deleteVoice

};
