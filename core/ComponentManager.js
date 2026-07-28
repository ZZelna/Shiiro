class ComponentManager {

    constructor(client) {

        this.client = client;

        this.buttons = new Map();

        this.selectMenus = new Map();

        this.modals = new Map();

    }

    registerButton(id, callback) {

        this.buttons.set(id, callback);

    }

    registerSelect(id, callback) {

        this.selectMenus.set(id, callback);

    }

    registerModal(id, callback) {

        this.modals.set(id, callback);

    }

    async handle(interaction) {

        try {

            if (interaction.isButton()) {

                const callback = this.buttons.get(interaction.customId);

                if (callback)
                    return callback(interaction);

            }

            if (
                interaction.isStringSelectMenu() ||
                interaction.isChannelSelectMenu() ||
                interaction.isRoleSelectMenu() ||
                interaction.isUserSelectMenu()
            ) {

                const callback = this.selectMenus.get(interaction.customId);

                if (callback)
                    return callback(interaction);

            }

            if (interaction.isModalSubmit()) {

                const callback = this.modals.get(interaction.customId);

                if (callback)
                    return callback(interaction);

            }

        } catch (err) {

            console.error(err);

        }

    }

}

module.exports = ComponentManager;
