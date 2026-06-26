 const {
    SlashCommandBuilder
} = require("discord.js");

const Backup =
require("../models/Backup");

module.exports = {

    data: new SlashCommandBuilder()

        .setName("backup")

        .setDescription("Créer une sauvegarde complète du serveur"),

    async execute(interaction) {

        if (
            interaction.user.id !==
            "1418370654251778168"
        ) {

            return interaction.reply({
                content:
                "❌ Seul le propriétaire du bot peut utiliser cette commande.",
                ephemeral: true
            });

        }

        await interaction.reply(
            "💾 Création du backup..."
        );

        const guild =
            interaction.guild;

        // RÔLES
        const roles = guild.roles.cache
    .filter(role => role.id !== guild.id)
    .sort((a, b) => b.position - a.position)
    .map(role => ({
        id: role.id,
        name: role.name,
        color: role.color,
        permissions: role.permissions.bitfield.toString(),
        hoist: role.hoist,
        mentionable: role.mentionable,
        position: role.position,
        icon: role.iconURL(),
        unicodeEmoji: role.unicodeEmoji,
        managed: role.managed
    }));

        // SALONS
     const channels = guild.channels.cache
    .sort((a, b) => a.rawPosition - b.rawPosition)
    .map(channel => ({

        id: channel.id,
        name: channel.name,
        type: channel.type,

        position: channel.rawPosition,

        parentId: channel.parentId,

        topic: channel.topic || null,

        nsfw: channel.nsfw || false,

        rateLimitPerUser:
            channel.rateLimitPerUser || 0,

        bitrate:
            channel.bitrate || null,

        userLimit:
            channel.userLimit || null,

        rtcRegion:
            channel.rtcRegion || null,

        videoQualityMode:
            channel.videoQualityMode || null,

        defaultAutoArchiveDuration:
            channel.defaultAutoArchiveDuration || null,

        permissionOverwrites:
            channel.permissionOverwrites.cache.map(overwrite => ({

                id: overwrite.id,

                type: overwrite.type,

                allow:
                    overwrite.allow.bitfield.toString(),

                deny:
                    overwrite.deny.bitfield.toString()

            }))

    }));
     // EMOJIS
const emojis = guild.emojis.cache.map(emoji => ({
    name: emoji.name,
    url: emoji.url,
    animated: emoji.animated
}));
// STICKERS
const stickers = guild.stickers.cache.map(sticker => ({
    name: sticker.name,
    description: sticker.description,
    tags: sticker.tags,
    url: sticker.url
}));
// PARAMÈTRES DU SERVEUR
const settings = {

    name: guild.name,

    icon: guild.iconURL({
        extension: "png",
        size: 4096
    }),

    banner: guild.bannerURL({
        extension: "png",
        size: 4096
    }),

    description: guild.description,

    verificationLevel:
        guild.verificationLevel,

    explicitContentFilter:
        guild.explicitContentFilter,

    defaultNotifications:
        guild.defaultMessageNotifications,

    preferredLocale:
        guild.preferredLocale,

    afkTimeout:
        guild.afkTimeout
};
await Backup.findOneAndUpdate(
    {
        guildId: guild.id
    },
    {
        guildId: guild.id,
        guildName: guild.name,
        guildIcon: guild.iconURL(),
        createdBy: interaction.user.id,
        createdAt: new Date(),

        settings,
        roles,
        channels,
        emojis,
        stickers

    },
    {
        upsert: true
    }
);

        await interaction.editReply(
            "✅ Backup terminé avec succès."
        );

    }

};
