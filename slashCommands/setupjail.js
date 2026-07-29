const {
    SlashCommandBuilder,
    PermissionFlagsBits,
    ChannelType
} = require("discord.js");

const JAIL_ROLE_ID = "1508842233619677306";
const JAIL_CATEGORY_ID = "1532095120688812152";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("setupjail")
        .setDescription("Configure les permissions de la catégorie Jail.")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const guild = interaction.guild;
        const jailRole = guild.roles.cache.get(JAIL_ROLE_ID);

        if (!jailRole) {
            return interaction.editReply("❌ Rôle Jail introuvable.");
        }

        for (const channel of guild.channels.cache.values()) {
            if (channel.type === ChannelType.GuildCategory) continue;

            if (channel.parentId === JAIL_CATEGORY_ID) {
                await channel.permissionOverwrites.edit(jailRole, {
                    ViewChannel: true,
                    SendMessages: true,
                    Connect: true,
                    Speak: true
                }).catch(() => {});
            } else {
                await channel.permissionOverwrites.edit(jailRole, {
                    ViewChannel: false
                }).catch(() => {});
            }
        }

        await interaction.editReply("✅ Permissions Jail configurées.");
    }
};
