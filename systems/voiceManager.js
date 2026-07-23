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

    if (!data) return;

    // Si quelqu'un est encore dans le vocal
    if (channel.members.size > 0) {

        // Si l'ancien propriétaire est toujours présent
        if (channel.members.has(data.ownerId)) return;

        // Nouveau propriétaire
        const newOwner = channel.members.first();

        if (!newOwner) return;

        data.ownerId = newOwner.id;

        await data.save();

        return;

    }

    // Plus personne dans le salon
    setTimeout(async () => {

        const refreshed = channel.guild.channels.cache.get(channel.id);

        if (!refreshed) return;

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
