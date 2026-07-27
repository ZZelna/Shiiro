const fs = require("fs");
const path = require("path");

class PluginManager {

    constructor(client) {
        this.client = client;
        this.plugins = new Map();
    }

    loadPlugins() {
        const pluginsPath = path.join(__dirname, "..", "plugins");

        if (!fs.existsSync(pluginsPath)) {
            fs.mkdirSync(pluginsPath, { recursive: true });
            return;
        }

        const folders = fs.readdirSync(pluginsPath);

        for (const folder of folders) {

            const pluginPath = path.join(pluginsPath, folder, "index.js");

            if (!fs.existsSync(pluginPath))
                continue;

            try {

                delete require.cache[require.resolve(pluginPath)];

                const plugin = require(pluginPath);

                plugin.name ??= folder;
                plugin.version ??= "1.0.0";
                plugin.enabled ??= true;

                plugin.client = this.client;

                if (typeof plugin.onLoad === "function")
                    plugin.onLoad(this.client);

                this.plugins.set(plugin.name, plugin);

                console.log(`🟢 Plugin chargé : ${plugin.name}`);

            } catch (err) {

                console.error(`❌ Impossible de charger ${folder}`);

                console.error(err);

            }

        }
    }

    unload(name) {

        const plugin = this.plugins.get(name);

        if (!plugin)
            return false;

        if (typeof plugin.onUnload === "function")
            plugin.onUnload(this.client);

        this.plugins.delete(name);

        return true;

    }

    reload(name) {

        const plugin = this.plugins.get(name);

        if (!plugin)
            return false;

        this.unload(name);

        const pluginPath = path.join(
            __dirname,
            "..",
            "plugins",
            name,
            "index.js"
        );

        delete require.cache[require.resolve(pluginPath)];

        const newPlugin = require(pluginPath);

        newPlugin.client = this.client;

        if (typeof newPlugin.onLoad === "function")
            newPlugin.onLoad(this.client);

        this.plugins.set(newPlugin.name, newPlugin);

        return true;

    }

    get(name) {
        return this.plugins.get(name);
    }

    getAll() {
        return [...this.plugins.values()];
    }

    has(name) {
        return this.plugins.has(name);
    }

}

module.exports = PluginManager;
