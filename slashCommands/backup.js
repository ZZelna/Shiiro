const { SlashCommandBuilder } = require("discord.js");
const Backup = require("../models/Backup");

module.exports = {

    data: new SlashCommandBuilder()
        .setName("backup")
        .setDescription("Créer une sauvegarde complète du serveur"),

    async execute(interaction) {

        if (interaction.user.id !== "1418370654251778168") {
            return interaction.reply({
                content: "❌ Seul le propriétaire du bot peut utiliser cette commande.",
                ephemeral: true
            });
        }

        if (!interaction.guild) {
            return interaction.reply({
                content: "❌ Cette commande doit être utilisée dans un serveur.",
                ephemeral: true
            });
        }

        await interaction.reply("💾 Création du backup...");

        const guild = interaction.guild;

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
                rateLimitPerUser: channel.rateLimitPerUser || 0,
                bitrate: channel.bitrate || null,
                userLimit: channel.userLimit || null,
                rtcRegion: channel.rtcRegion || null,
                videoQualityMode: channel.videoQualityMode || null,
                defaultAutoArchiveDuration: channel.defaultAutoArchiveDuration || null,
                permissionOverwrites: channel.permissionOverwrites?.cache?.map(o => ({
    id: o.id,
    type: o.type,
    allow: o.allow.bitfield.toString(),
    deny: o.deny.bitfield.toString()
})) ?? []

            }));

        const emojis = guild.emojis.cache.map(emoji => ({
            name: emoji.name,
            url: emoji.url,
            animated: emoji.animated
        }));

        const stickers = guild.stickers.cache.map(sticker => ({
            name: sticker.name,
            description: sticker.description,
            tags: sticker.tags,
            url: sticker.url
        }));

        await Backup.findOneAndUpdate(
            { guildId: guild.id },
            {
                guildId: guild.id,
                guildName: guild.name,
                guildIcon: guild.iconURL(),
                guildBanner: guild.bannerURL() || null,
                createdBy: interaction.user.id,
                createdAt: new Date(),
                verificationLevel: guild.verificationLevel,
                afkTimeout: guild.afkTimeout,
                roles,
                channels,
                emojis,
                stickers
            },
            { upsert: true, new: true }
        );

        await interaction.editReply("✅ Backup terminé avec succès.");
    }
};
