// systems/marriage/requests.js

const requests = new Map();

/*
Structure :

{
    authorId: {
        targetId,
        guildId,
        createdAt
    }
}
*/

module.exports = {

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

    has(authorId) {
        return requests.has(authorId);
    },

    clearExpired(maxAge = 5 * 60 * 1000) {
        const now = Date.now();

        for (const [authorId, request] of requests.entries()) {
            if (now - request.createdAt > maxAge) {
                requests.delete(authorId);
            }
        }
    }

};
