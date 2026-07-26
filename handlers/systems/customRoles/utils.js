const GuildConfig = require("../../../models/GuildConfig");
const CustomRole = require("../../../models/CustomRole");

/**
 * Vérifie si un membre peut posséder un rôle personnalisé.
 */
async function isEligible(member, guildId) {

    if (member.premiumSince)
        return true;

    const config = await GuildConfig.findOne({
        guildId
    });

    if (
        config?.customRoleUnlockRoleId &&
        member.roles.cache.has(
            config.customRoleUnlockRoleId
        )
    ) {
        return true;
    }

    return false;

}

/**
 * Retourne le rôle personnalisé d'un utilisateur.
 */
async function getCustomRole(guildId, userId) {

    return await CustomRole.findOne({
        guildId,
        userId
    });

}

/**
 * Vérifie si une commande est déjà utilisée.
 */
async function commandExists(guildId, commandName, userId = null) {

    const query = {
        guildId,
        commandName: commandName.toLowerCase()
    };

    if (userId) {
        query.userId = {
            $ne: userId
        };
    }

    return await CustomRole.findOne(query);

}

/**
 * Positionne correctement le rôle personnalisé.
 */
async function positionCustomRole(
    guild,
    member,
    role
) {

    const config = await GuildConfig.findOne({
        guildId: guild.id
    });

    if (
        !config?.customRoleTopRoleId ||
        !config?.customRoleBottomRoleId
    ) return;

    const topRole = guild.roles.cache.get(
        config.customRoleTopRoleId
    );

    const bottomRole = guild.roles.cache.get(
        config.customRoleBottomRoleId
    );

    if (
        !topRole ||
        !bottomRole
    ) return;

    const min =
        bottomRole.position + 1;

    const max =
        topRole.position - 1;

    if (min > max)
        return;

    const highestRole =
        member.roles.cache

        .filter(r =>
            r.id !== role.id &&
            r.id !== guild.id
        )

        .sort(
            (a, b) =>
                b.position - a.position
        )

        .first();

    const target = Math.min(
        Math.max(
            highestRole
                ? highestRole.position
                : min,
            min
        ),
        max
    );

    await role
        .setPosition(target)
        .catch(() => {});

}

module.exports = {

    isEligible,
    getCustomRole,
    commandExists,
    positionCustomRole

};
