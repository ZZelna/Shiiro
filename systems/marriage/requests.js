// systems/marriage/requests.js

const requests = new Map();

module.exports = {

    set(authorId, targetId, guildId) {
        requests.set(authorId, {
            targetId,
            guildId,
            createdAt: Date.now()
        });
    },

    create(authorId, targetId, guildId) {
        requests.set(authorId, {
            targetId,
            guildId,
            createdAt: Date.now()
        });
    },

    get(authorId) {
        return requests.get(authorId);
    },

    has(authorId) {
        return requests.has(authorId);
    },

    delete(authorId) {
        return requests.delete(authorId);
    },

    findByTarget(targetId) {
        for (const [authorId, request] of requests.entries()) {
            if (request.targetId === targetId) {
                return {
                    authorId,
                    ...request
                };
            }
        }

        return null;
    },

    clearExpired(maxAge = 5 * 60 * 1000) {
        const now = Date.now();

        for (const [authorId, request] of requests.entries()) {
            if (now - request.createdAt > maxAge) {
                requests.delete(authorId);
            }
        }
    },

    values() {
        return requests.values();
    },

    entries() {
        return requests.entries();
    },

    clear() {
        requests.clear();
    }

};
