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
        const roles =
            guild.roles.cache
                .filter(
                    role => role.id !== guild.id
                )
                .sort(
                    (a, b) =>
                        b.position - a.position
                )
                .map(role => ({
                    name: role.name,
                    color: role.color,
                    permissions:
                        role.permissions.bitfield.toString(),
                    hoist: role.hoist,
                    mentionable:
                        role.mentionable,
                    position:
                        role.position
                }));

        // SALONS
        const channels =
            guild.channels.cache
                .sort(
                    (a, b) =>
                        a.position - b.position
                )
                .map(channel => ({

                    name: channel.name,

                    type: channel.type,

                    position:
                        channel.position,

                    parent:
                        channel.parent
                            ?.name || null,

                    topic:
                        channel.topic || null,

                    nsfw:
                        channel.nsfw || false,

                    rateLimitPerUser:
                        channel.rateLimitPerUser || 0,

                    bitrate:
                        channel.bitrate || 64000,

                    userLimit:
                        channel.userLimit || 0,

                    permissionOverwrites:
                        channel.permissionOverwrites.cache.map(
                            overwrite => ({

                                id:
                                    overwrite.id,

                                type:
                                    overwrite.type,

                                allow:
                                    overwrite.allow.bitfield.toString(),

                                deny:
                                    overwrite.deny.bitfield.toString()

                            })
                        )

                }));

        await Backup.findOneAndUpdate(

            {
                guildId:
                    guild.id
            },

            {

                guildId:
                    guild.id,

                guildName:
                    guild.name,

                guildIcon:
                    guild.iconURL(),

                createdBy:
                    interaction.user.id,

                createdAt:
                    new Date(),

                roles,

                channels

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
