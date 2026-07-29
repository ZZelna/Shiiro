const Jail = require("../../models/Jail");

async function isJailed(userId) {
    const entry = await Jail.findOne({ userId });
    return Boolean(entry);
}

async function getJailEntry(userId) {
    return Jail.findOne({ userId });
}

async function setJailEntry(userId, entry) {
    return Jail.findOneAndUpdate(
        { userId },
        { userId, ...entry },
        { upsert: true, new: true }
    );
}

async function updateJailEntry(userId, partial) {
    return Jail.findOneAndUpdate({ userId }, partial, { new: true });
}

async function deleteJailEntry(userId) {
    return Jail.findOneAndDelete({ userId });
}

module.exports = {
    isJailed,
    getJailEntry,
    setJailEntry,
    updateJailEntry,
    deleteJailEntry
};
