const {
    SlashCommandBuilder,
    ContainerBuilder,
    TextDisplayBuilder,
    SeparatorBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    MessageFlags,
} = require("discord.js");
const { PING_ROLES, buildPingContainer } = require("../handlers/systems/pingHandler");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("pings")
        .setDescription("Choisis les pings que tu veux recevoir"),

    async execute(interaction) {
        const container = buildPingContainer(interaction.member);

        await interaction.reply({
            components: [container],
            flags: MessageFlags.IsComponentsV2,
        });
    },
};
