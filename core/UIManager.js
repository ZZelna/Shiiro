const {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    StringSelectMenuBuilder,
    ChannelSelectMenuBuilder,
    RoleSelectMenuBuilder,
    UserSelectMenuBuilder,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    ButtonStyle
} = require("discord.js");

class UIManager {

    constructor(client = null) {
        this.client = client;

        this.colors = {
            primary: "#4DA3FF",
            success: "#57F287",
            danger: "#ED4245",
            warning: "#FEE75C",
            neutral: "#2B2D31"
        };
    }

    embed(options = {}) {

        return new EmbedBuilder()
            .setColor(options.color ?? this.colors.primary)
            .setTitle(options.title ?? null)
            .setDescription(options.description ?? null)
            .setThumbnail(options.thumbnail ?? null)
            .setImage(options.image ?? null)
            .setFooter(
                options.footer
                    ? {
                        text: options.footer,
                        iconURL: options.footerIcon
                    }
                    : null
            )
            .setTimestamp();

    }

    pluginEmbed(plugin, title, description) {

        return this.embed({

            title: `${plugin.icon} ${plugin.displayName}`,

            description,

            color: this.colors.primary,

            footer: `Plugin • ${plugin.version}`

        });

    }

    button(id, label, style = ButtonStyle.Primary, emoji = null) {

        const button = new ButtonBuilder()
            .setCustomId(id)
            .setLabel(label)
            .setStyle(style);

        if (emoji)
            button.setEmoji(emoji);

        return button;

    }

    row(...components) {

        return new ActionRowBuilder().addComponents(...components);

    }

    stringMenu(id, placeholder, options) {

        return new StringSelectMenuBuilder()
            .setCustomId(id)
            .setPlaceholder(placeholder)
            .addOptions(options);

    }

    channelMenu(id, placeholder) {

        return new ChannelSelectMenuBuilder()
            .setCustomId(id)
            .setPlaceholder(placeholder);

    }

    roleMenu(id, placeholder) {

        return new RoleSelectMenuBuilder()
            .setCustomId(id)
            .setPlaceholder(placeholder);

    }

    userMenu(id, placeholder) {

        return new UserSelectMenuBuilder()
            .setCustomId(id)
            .setPlaceholder(placeholder);

    }

    modal(id, title) {

        return new ModalBuilder()

            .setCustomId(id)

            .setTitle(title);

    }

    input(id, label, style = TextInputStyle.Short, required = true) {

        return new TextInputBuilder()

            .setCustomId(id)

            .setLabel(label)

            .setStyle(style)

            .setRequired(required);

    }

}

module.exports = new UIManager();
