const Config = require("./ConfigManager");

class PermissionManager {

    constructor(client) {
        this.client = client;
    }

    async has(interaction, permission) {

        const member = interaction.member;
        const guildId = interaction.guild.id;

        // Owner du bot
        if (this.client.config?.owner_ids?.includes(member.id))
            return true;

        // Administrateur Discord
        if (member.permissions.has("Administrator"))
            return true;

        switch (permission) {

            case "casino.admin": {

                const role = await Config.get(
                    guildId,
                    "plugins.casino.roles.admin"
                );

                return role
                    ? member.roles.cache.has(role)
                    : false;

            }

            case "casino.staff": {

                const role = await Config.get(
                    guildId,
                    "plugins.casino.roles.staff"
                );

                return role
                    ? member.roles.cache.has(role)
                    : false;

            }

            case "tickets.support": {

                const role = await Config.get(
                    guildId,
                    "plugins.tickets.roles.support"
                );

                return role
                    ? member.roles.cache.has(role)
                    : false;

            }

            case "moderation.admin": {

                const role = await Config.get(
                    guildId,
                    "plugins.moderation.roles.admin"
                );

                return role
                    ? member.roles.cache.has(role)
                    : false;

            }

            case "moderation.staff": {

                const role = await Config.get(
                    guildId,
                    "plugins.moderation.roles.moderator"
                );

                return role
                    ? member.roles.cache.has(role)
                    : false;

            }

            default:
                return false;

        }

    }

}

module.exports = PermissionManager;
