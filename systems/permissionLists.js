const PermissionList = require("../models/PermissionList");

async function getPermissionList(guildId) {
    let doc = await PermissionList.findOne({ guildId });
    if (!doc) {
        doc = await PermissionList.create({ guildId });
    }
    return doc;
}

// listName: "owners" | "whitelist"
async function addToList(guildId, listName, userId) {
    const doc = await getPermissionList(guildId);
    if (!doc[listName].includes(userId)) {
        doc[listName].push(userId);
        await doc.save();
    }
    return doc;
}

async function removeFromList(guildId, listName, userId) {
    const doc = await getPermissionList(guildId);
    doc[listName] = doc[listName].filter(id => id !== userId);
    await doc.save();
    return doc;
}

module.exports = { getPermissionList, addToList, removeFromList };
