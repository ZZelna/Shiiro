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

module.exports = {

    createVoice

};
