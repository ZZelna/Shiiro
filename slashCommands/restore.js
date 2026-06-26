const {
    SlashCommandBuilder,
    ChannelType,
    PermissionsBitField
} = require("discord.js");

const Backup =
require("../models/Backup");

module.exports = {

    data: new SlashCommandBuilder()

        .setName("restore")

        .setDescription(
            "Restaure complètement le serveur"
        ),

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
            "♻️ Début de la restauration..."
        );
try {  
        const guild =
            interaction.guild;
    console.log("Guild ID pour restore:", guild.id);


        // ==========================
        // CHARGEMENT DU BACKUP
        // ==========================

        const backup =
            await Backup.findOne({

                guildId:
                    guild.id

            });

        if (!backup) {

            return interaction.editReply(
                "❌ Aucun backup trouvé."
            );

        }

        // ==========================
        // MAPS
        // ==========================

        const roleMap =
            new Map();

        const categoryMap =
            new Map();

        console.log(
            "✅ Backup chargé."
        );
                // ==========================
        // SUPPRESSION DES RÔLES
        // ==========================

        const botRole = guild.members.me?.roles?.highest?.id;

const rolesToDelete = guild.roles.cache
    .filter(role =>
        role.id !== guild.id &&
        role.id !== botRole
    )
    .sort((a, b) => b.position - a.position);


        for (const role of rolesToDelete.values()) {

            try {

                await role.delete(
                    "Restauration du serveur"
                );

            } catch (err) {

                console.log(
                    `Impossible de supprimer ${role.name}`
                );

            }

        }

        // ==========================
        // CRÉATION DES RÔLES
        // ==========================

        const roles =
            [...backup.roles]
                .sort((a, b) => a.position - b.position);

        for (const role of roles) {

            try {

                const createdRole =
                    await guild.roles.create({

                        name: role.name,

                        color: role.color,

                        permissions:
                            BigInt(role.permissions),

                        hoist: role.hoist,

                        mentionable:
                            role.mentionable,

                        reason:
                            "Restauration du serveur"

                    });

                roleMap.set(
                    role.name,
                    createdRole.id
                );

            } catch (err) {

                console.log(
                    `Erreur création rôle ${role.name}`,
                    err.message
                );

            }

        }

        // ==========================
        // REMISE DES POSITIONS
        // ==========================

        const createdRoles =
            guild.roles.cache
                .filter(role =>
                    role.id !== guild.id
                );

        for (const role of roles) {

            const created =
                createdRoles.find(
                    r => r.name === role.name
                );

            if (!created)
                continue;

            try {

                await created.setPosition(
                    role.position
                );

            } catch {}

        }

        console.log(
            "✅ Tous les rôles ont été restaurés."
        );
                // ==========================
        // SUPPRESSION DES SALONS
        // ==========================

        const channelsToDelete =
            guild.channels.cache.sort(
                (a, b) => b.rawPosition - a.rawPosition
            );

        for (const channel of channelsToDelete.values()) {

            try {

                await channel.delete(
                    "Restauration du serveur"
                );

            } catch (err) {

                console.log(
                    `Impossible de supprimer ${channel.name}`
                );

            }

        }

        // ==========================
        // CRÉATION DES CATÉGORIES
        // ==========================

        const categories =
            backup.channels
                .filter(
                    c => c.type === ChannelType.GuildCategory
                )
                .sort(
                    (a, b) =>
                        a.position - b.position
                );

        for (const category of categories) {

            try {

                const createdCategory =
                    await guild.channels.create({

                        name:
                            category.name,

                        type:
                            ChannelType.GuildCategory,

                        permissionOverwrites:
                            category.permissionOverwrites.map(
                                overwrite => ({

                                    id:
                                        roleMap.get(overwrite.id)
                                        || overwrite.id,

                                    type:
                                        overwrite.type,

                                    allow:
                                        BigInt(overwrite.allow),

                                    deny:
                                        BigInt(overwrite.deny)

                                })
                            )

                    });

                categoryMap.set(
                    category.name,
                    createdCategory.id
                );

            } catch (err) {

                console.log(
                    `Erreur catégorie ${category.name}`,
                    err.message
                );

            }

        }

        console.log(
            "✅ Catégories restaurées."
        );
                // ==========================
        // CRÉATION DES SALONS
        // ==========================

        const normalChannels =
            backup.channels
                .filter(
                    c => c.type !== ChannelType.GuildCategory
                )
                .sort(
                    (a, b) =>
                        a.position - b.position
                );
const idToName = new Map(
    backup.channels.map(c => [c.id, c.name])
);
        for (const channel of normalChannels) {

            try {

                const overwrites =
                    channel.permissionOverwrites.map(
                        overwrite => ({

                            id:
                                roleMap.get(overwrite.id) ||
                                categoryMap.get(overwrite.id) ||
                                overwrite.id,

                            type:
                                overwrite.type,

                            allow:
                                BigInt(overwrite.allow),

                            deny:
                                BigInt(overwrite.deny)

                        })
                    );

                const options = {

    name:
        channel.name,

    type:
        channel.type,

    parent:
        channel.parentId
            ? categoryMap.get(idToName.get(channel.parentId))
            : null,

                    permissionOverwrites:
                        overwrites

                };

                // Salons texte
                if (
                    channel.type ===
                    ChannelType.GuildText
                ) {

                    options.topic =
                        channel.topic;

                    options.nsfw =
                        channel.nsfw;

                    options.rateLimitPerUser =
                        channel.rateLimitPerUser;

                }

                // Salons vocaux
                if (
                    channel.type ===
                    ChannelType.GuildVoice
                ) {

                    options.bitrate =
                        channel.bitrate;

                    options.userLimit =
                        channel.userLimit;

                }

                // Forum
                if (
                    channel.type ===
                    ChannelType.GuildForum
                ) {

                    options.nsfw =
                        channel.nsfw;

                }

                await guild.channels.create(
                    options
                );

            } catch (err) {

                console.log(
                    `Erreur création salon ${channel.name}`,
                    err.message
                );

            }

        }

        console.log(
            "✅ Tous les salons restaurés."
        );
                // ==========================
        // REMISE DES POSITIONS
        // ==========================

        const guildChannels =
            guild.channels.cache;

        for (const savedChannel of backup.channels) {

            const created =
                guildChannels.find(
                    c => c.name === savedChannel.name
                );

            if (!created)
                continue;

            try {

                await created.setPosition(
                    savedChannel.position
                );

            } catch {}

        }

        // ==========================
        // NOM DU SERVEUR
        // ==========================

        try {

            await guild.setName(
                backup.guildName
            );

        } catch (err) {

            console.log(
                "Impossible de restaurer le nom."
            );

        }

        // ==========================
        // ICÔNE DU SERVEUR
        // ==========================

        if (backup.guildIcon) {

            try {

                await guild.setIcon(
                    backup.guildIcon
                );

            } catch (err) {

                console.log(
                    "Impossible de restaurer l'icône."
                );

            }

        }
        // ==========================
// BANNIÈRE DU SERVEUR
// ==========================

if (backup.guildBanner) {

    try {

        await guild.setBanner(
            backup.guildBanner
        );

    } catch (err) {

        console.log(
            "Impossible de restaurer la bannière."
        );

    }

}

// ==========================
// NIVEAU DE VÉRIFICATION
// ==========================

if (backup.verificationLevel !== undefined) {

    try {

        await guild.setVerificationLevel(
            backup.verificationLevel
        );

    } catch (err) {

        console.log(
            "Impossible de restaurer le niveau de vérification."
        );

    }

}

// ==========================
// SYSTÈME AFK
// ==========================

if (backup.afkChannel) {

    try {

        const afk =
            guild.channels.cache.find(
                c => c.name === backup.afkChannel
            );

        if (afk) {

            await guild.edit({

                afkChannel: afk,

                afkTimeout:
                    backup.afkTimeout

            });

        }

    } catch (err) {

        console.log(
            "Impossible de restaurer l'AFK."
        );

    }

}

// ==========================
// EMOJIS
// ==========================

if (backup.emojis?.length) {

    for (const emoji of backup.emojis) {

        try {

            await guild.emojis.create({

                attachment: emoji.url,

                name: emoji.name

            });

        } catch {}

    }

}

// ==========================
// STICKERS
// ==========================

if (backup.stickers?.length) {

    for (const sticker of backup.stickers) {

        try {

            await guild.stickers.create({

                file: sticker.url,

                name: sticker.name,

                tags: sticker.tags || "backup"

            });

        } catch {}

    }

}

// ==========================
// WEBHOOKS
// ==========================

if (backup.webhooks?.length) {

    for (const hook of backup.webhooks) {

        try {

            const channel =
                guild.channels.cache.find(
                    c => c.name === hook.channel
                );

            if (!channel) continue;

            await channel.createWebhook({

                name: hook.name,

                avatar: hook.avatar

            });

        } catch {}

    }

}

        // ==========================
        // FIN
        // ==========================

        await interaction.editReply(
            "✅ **Serveur restauré avec succès.**"
        );

    } catch (err) {

        console.error(err);

        await interaction.editReply(
            "❌ Une erreur est survenue pendant la restauration."
        );

    }

}
};
