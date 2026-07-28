const ShieldConfig = require("../models/ShieldConfig");
const { getPermissionList } = require("./permissionLists");

const DEFAULT_MODULE = {
    enabled: true,
    ignoredChannels: [],
    ignoredRoles: [],
    whitelistLinks: [],
    punishment: "timeout",
    timeoutDuration: 20,
    logsChannel: null,
    exemptOwners: false,
    exemptWhitelist: false
};

// Récupère les réglages d'un module pour une guilde. Crée le document
// de guilde et/ou l'entrée du module avec les valeurs par défaut si
// besoin. Aucun risque de conflit d'index : un seul document par
// guildId, exactement comme avant.
async function getShieldConfig(guildId, moduleId) {
    let doc = await ShieldConfig.findOne({ guildId });
    if (!doc) {
        doc = await ShieldConfig.create({ guildId, modules: {} });
    }

    let moduleConfig = doc.modules.get(moduleId);
    if (!moduleConfig) {
        doc.modules.set(moduleId, DEFAULT_MODULE);
        await doc.save();
        moduleConfig = doc.modules.get(moduleId);
    }

    return moduleConfig;
}

// Met à jour (fusion partielle) les réglages d'un module.
async function updateShieldConfig(guildId, moduleId, update) {
    let doc = await ShieldConfig.findOne({ guildId });
    if (!doc) {
        doc = await ShieldConfig.create({ guildId, modules: {} });
    }

    const current = doc.modules.get(moduleId) || DEFAULT_MODULE;
    const currentPlain = typeof current.toObject === "function" ? current.toObject() : current;

    const merged = { ...currentPlain, ...update };
    doc.modules.set(moduleId, merged);
    await doc.save();

    return doc.modules.get(moduleId);
}

// Vrai si le membre doit être exempté du module : liste des
// propriétaires, liste blanche (toutes deux gérées via
// /permissionlist), ou rôle/utilisateur indépendant choisi pour ce
// module précis (config.ignoredRoles).
async function isBypassed(member, config) {
    if (!member || !config) return false;

    if (config.exemptOwners || config.exemptWhitelist) {
        const list = await getPermissionList(member.guild.id);
        if (config.exemptOwners && list.owners.includes(member.id)) return true;
        if (config.exemptWhitelist && list.whitelist.includes(member.id)) return true;
    }

    return member.roles.cache.some(role => config.ignoredRoles.includes(role.id))
        || config.ignoredRoles.includes(member.id);
}

module.exports = { getShieldConfig, updateShieldConfig, isBypassed };
