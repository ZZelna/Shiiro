class Cache {

    constructor(options = {}) {

        this.cache = new Map();

        this.defaultTTL = options.defaultTTL ?? 300000; // 5 minutes

    }

    set(key, value, ttl = this.defaultTTL) {

        this.cache.set(key, {
            value,
            expires: Date.now() + ttl
        });

        return value;

    }

    get(key) {

        const data = this.cache.get(key);

        if (!data)
            return null;

        if (Date.now() > data.expires) {

            this.cache.delete(key);

            return null;

        }

        return data.value;

    }

    has(key) {

        return this.get(key) !== null;

    }

    delete(key) {

        return this.cache.delete(key);

    }

    clear() {

        this.cache.clear();

    }

    refresh(key, ttl = this.defaultTTL) {

        const value = this.get(key);

        if (value === null)
            return false;

        this.set(key, value, ttl);

        return true;

    }

    keys() {

        return [...this.cache.keys()];

    }

    values() {

        return [...this.cache.values()].map(v => v.value);

    }

    size() {

        return this.cache.size;

    }

}

module.exports = new Cache();
