const GuildConfig = require("../models/GuildConfig");

class ConfigManager {

    static async getGuild(guildId) {
        let config = await GuildConfig.findOne({ guildId });

        if (!config) {
            config = await GuildConfig.create({
                guildId
            });
        }

        return config;
    }

    static async get(guildId, path = null) {
        const config = await this.getGuild(guildId);

        if (!path) return config;

        return path
            .split(".")
            .reduce((obj, key) => obj?.[key], config);
    }

    static async set(guildId, path, value) {
        await this.getGuild(guildId);

        await GuildConfig.updateOne(
            { guildId },
            {
                $set: {
                    [path]: value
                }
            }
        );

        return value;
    }

    static async delete(guildId, path) {
        await this.getGuild(guildId);

        await GuildConfig.updateOne(
            { guildId },
            {
                $unset: {
                    [path]: ""
                }
            }
        );
    }

    static async has(guildId, path) {
        const value = await this.get(guildId, path);

        return value !== undefined && value !== null;
    }

    static async toggle(guildId, path) {
        const current = await this.get(guildId, path);

        await this.set(guildId, path, !current);

        return !current;
    }

    static async increment(guildId, path, amount = 1) {
        await this.getGuild(guildId);

        await GuildConfig.updateOne(
            { guildId },
            {
                $inc: {
                    [path]: amount
                }
            }
        );
    }

    static async push(guildId, path, value) {
        await this.getGuild(guildId);

        await GuildConfig.updateOne(
            { guildId },
            {
                $push: {
                    [path]: value
                }
            }
        );
    }

    static async pull(guildId, path, value) {
        await this.getGuild(guildId);

        await GuildConfig.updateOne(
            { guildId },
            {
                $pull: {
                    [path]: value
                }
            }
        );
    }

}

module.exports = ConfigManager;
