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
            "♻️ Restauration du serveur..."
        );

        const guild =
            interaction.guild;

        const backup =
            await Backup.findOne({
                guildId: guild.id
            });

        if (!backup) {

            return interaction.editReply(
                "❌ Aucun backup trouvé."
            );

        }

        //
        // SUPPRESSION DES SALONS
        //

        for (const channel of guild.channels.cache.values()) {

            try {

                await channel.delete();

            } catch {}

        }

        //
        // SUPPRESSION DES RÔLES
        //

        for (const role of guild.roles.cache.values()) {

            if (
                role.id === guild.id
            ) continue;

            if (
                role.managed
            ) continue;

            try {

                await role.delete();

            } catch {}

        }

        //
        // DICTIONNAIRES
        //

        const createdRoles =
            new Map();

        const createdCategories =
            new Map();
              //
        // RECRÉATION DES RÔLES
        //

        const sortedRoles =
            [...backup.roles]
                .sort(
                    (a, b) =>
                        a.position - b.position
                );

        for (const role of sortedRoles) {

            try {

                const newRole =
                    await guild.roles.create({

                        name:
                            role.name,

                        color:
                            role.color,

                        hoist:
                            role.hoist,

                        mentionable:
                            role.mentionable,

                        permissions:
                            new PermissionsBitField(
                                BigInt(
                                    role.permissions
                                )
                            )

                    });

                createdRoles.set(
                    role.name,
                    newRole
                );

            } catch (err) {

                console.log(
                    "Erreur rôle :",
                    role.name
                );

            }

        }

        //
        // RECRÉATION DES CATÉGORIES
        //

        const categories =
            backup.channels.filter(
                c =>
                    c.type ===
                    ChannelType.GuildCategory
            );

        for (const category of categories) {

            try {

                const overwrites = [];

                for (
                    const perm
                    of category.permissionOverwrites
                ) {

                    const role =
                        createdRoles.get(
                            perm.id
                        );

                    overwrites.push({

                        id:
                            role
                                ? role.id
                                : guild.id,

                        allow:
                            BigInt(
                                perm.allow
                            ),

                        deny:
                            BigInt(
                                perm.deny
                            )

                    });

                }

                const newCategory =
                    await guild.channels.create({

                        name:
                            category.name,

                        type:
                            ChannelType.GuildCategory,

                        permissionOverwrites:
                            overwrites

                    });

                createdCategories.set(
                    category.name,
                    newCategory
                );

            } catch (err) {

                console.log(
                    "Erreur catégorie :",
                    category.name
                );

            }

        }
