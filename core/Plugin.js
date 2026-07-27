class Plugin {

    constructor(options = {}) {

        this.name = options.name ?? "plugin";

        this.displayName = options.displayName ?? this.name;

        this.description = options.description ?? "Aucune description";

        this.version = options.version ?? "1.0.0";

        this.author = options.author ?? "Shiiro";

        this.icon = options.icon ?? "📦";

        this.enabled = options.enabled ?? true;

        this.commands = [];

        this.events = [];

        this.client = null;

    }

    async onLoad(client) {

        this.client = client;

    }

    async onEnable() {}

    async onDisable() {}

    async onUnload() {}

    async onConfigOpen(interaction) {}

    async registerCommand(command) {

        this.commands.push(command);

    }

    async registerEvent(event) {

        this.events.push(event);

    }

    getCommands() {

        return this.commands;

    }

    getEvents() {

        return this.events;

    }

    toJSON() {

        return {

            name: this.name,

            displayName: this.displayName,

            description: this.description,

            version: this.version,

            author: this.author,

            icon: this.icon,

            enabled: this.enabled,

            commands: this.commands.length,

            events: this.events.length

        };

    }

}

module.exports = Plugin;
