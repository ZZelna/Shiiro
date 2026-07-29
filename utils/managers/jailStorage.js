const fs = require("fs");
const path = require("path");

const JAIL_FILE = path.join(__dirname, "..", "data", "jail.json");

function ensureFile() {
    const dir = path.dirname(JAIL_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    if (!fs.existsSync(JAIL_FILE)) fs.writeFileSync(JAIL_FILE, "{}");
}

function loadJail() {
    ensureFile();
    try {
        const raw = fs.readFileSync(JAIL_FILE, "utf8");
        return JSON.parse(raw || "{}");
    } catch {
        return {};
    }
}

function saveJail(data) {
    ensureFile();
    fs.writeFileSync(JAIL_FILE, JSON.stringify(data, null, 4));
}

function isJailed(userId) {
    const data = loadJail();
    return Boolean(data[userId]);
}

function getJailEntry(userId) {
    const data = loadJail();
    return data[userId] || null;
}

function setJailEntry(userId, entry) {
    const data = loadJail();
    data[userId] = entry;
    saveJail(data);
}

function updateJailEntry(userId, partial) {
    const data = loadJail();
    if (!data[userId]) return null;
    data[userId] = { ...data[userId], ...partial };
    saveJail(data);
    return data[userId];
}

function deleteJailEntry(userId) {
    const data = loadJail();
    if (!data[userId]) return null;
    const entry = data[userId];
    delete data[userId];
    saveJail(data);
    return entry;
}

module.exports = {
    loadJail,
    saveJail,
    isJailed,
    getJailEntry,
    setJailEntry,
    updateJailEntry,
    deleteJailEntry
};
