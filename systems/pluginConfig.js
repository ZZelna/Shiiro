const PluginConfig = require("../models/PluginConfig");

// Liste des gros systèmes gérables via /plugins.
// id = clé technique utilisée partout dans le code, label = affichage.
const PLUGINS = [
    { id: "casino", label: "Casino" },
    { id: "economie", label: "Économie" },
    { id: "boutique", label: "Boutique" },
    { id: "tickets", label: "Tickets" },
    { id: "giveaway", label: "Giveaway" },
    { id: "welcome", label: "Welcome" },
    { id: "mariage", label: "Mariage" },
    { id: "musique", label: "Musique" },
    { id: "niveaux", label: "Niveaux" }
];

async function getPluginConfig(guildId) {
    let doc = await PluginConfig.findOne({ guildId });
    if (!doc) {
        doc = await PluginConfig.create({ guildId, plugins: {} });
    }
    return doc;
}

// Activé par défaut tant que rien n'a été explicitement désactivé.
function resolveState(doc, pluginId) {
    const value = doc.plugins.get(pluginId);
    return value === undefined ? true : value;
}

async function isPluginEnabled(guildId, pluginId) {
    const doc = await getPluginConfig(guildId);
    return resolveState(doc, pluginId);
}

async function setPluginEnabled(guildId, pluginId, enabled) {
    const doc = await getPluginConfig(guildId);
    doc.plugins.set(pluginId, enabled);
    await doc.save();
    return doc;
}

module.exports = { PLUGINS, getPluginConfig, resolveState, isPluginEnabled, setPluginEnabled };
