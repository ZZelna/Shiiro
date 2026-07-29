const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { isJailed, getJailEntry, deleteJailEntry } = require("../../utils/jailStorage");

const MOD_ROLES = ["1517238655444451520", "1506674274826584284"];
const JAIL_ROLE_ID = "1508842233619677306";
const LOGS_JAIL = "1520445447263486236";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("unjail")
        .setDescription("Retire un membre du SecureJail et restaure ses rôles.")
        .addUserOption(opt =>
            opt.setName("membre")
                .setDescription("Le membre à sortir du jail")
                .setRequired(true)
        ),

    async execute(interaction) {
        // =========================
        // PERMISSIONS DU MODÉRATEUR
        // =========================
        const executorRoles = interaction.member.roles.cache;
        const hasPermission = MOD_ROLES.some(roleId => executorRoles.has(roleId));

        if (!hasPermission) {
            return interaction.reply({
                content: "❌ Tu n'as pas la permission d'utiliser cette commande.",
                ephemeral: true
            });
        }

        const targetUser = interaction.options.getUser("membre");

        if (!isJailed(targetUser.id)) {
            return interaction.reply({
                content: "❌ Ce membre n'est pas en SecureJail.",
                ephemeral: true
            });
        }

        await interaction.deferReply({ ephemeral: true });

        const entry = getJailEntry(targetUser.id);

        // =========================
        // RESTAURATION DES RÔLES
        // =========================
        const member = await interaction.guild.members.fetch(targetUser.id).catch(() => null);

        if (member) {
            const validRoles = entry.roles.filter(roleId =>
                interaction.guild.roles.cache.has(roleId)
            );

            // On préserve les rôles managed actuels (ex: Server Booster) qui ont pu
            // persister ou changer pendant le jail — ils ne sont pas dans "entry.roles".
            const currentManagedRoleIds = member.roles.cache
                .filter(r => r.managed)
                .map(r => r.id);

            try {
                await member.roles.set([...validRoles, ...currentManagedRoleIds]);
            } catch (err) {
                console.error("Erreur lors de la restauration des rôles :", err);
                await interaction.followUp({
                    content: "⚠️ Impossible de restaurer tous les rôles (permissions/hiérarchie). Le membre reste jailé, vérifie manuellement.",
                    ephemeral: true
                });
            }
        }

        // =========================
        // SUPPRESSION DU SALON
        // =========================
        if (entry.channelId) {
            const jailChannel = interaction.guild.channels.cache.get(entry.channelId);
            if (jailChannel) {
                await jailChannel.delete().catch(() => null);
            }
        }

        // =========================
        // NETTOYAGE jail.json
        // =========================
        deleteJailEntry(targetUser.id);

        // =========================
        // LOGS
        // =========================
        try {
            const logsGuild = interaction.client.guilds.cache.find(g =>
                g.channels.cache.has(LOGS_JAIL)
            );
            const logsChannel = logsGuild?.channels.cache.get(LOGS_JAIL);
            if (logsChannel) {
                const logEmbed = new EmbedBuilder()
                    .setColor("Green")
                    .setTitle("🔓 SecureJail levé")
                    .addFields(
                        { name: "Cible", value: `${targetUser.username} (ID: ${targetUser.id})`, inline: true },
                        { name: "Modérateur", value: `${interaction.user.username} (ID: ${interaction.user.id})`, inline: true },
                        { name: "Rôles restaurés", value: `${entry.roles.length}`, inline: true }
                    )
                    .setTimestamp();

                await logsChannel.send({ embeds: [logEmbed] });
            }
        } catch (err) {
            console.error("Erreur logs unjail :", err);
        }

        return interaction.editReply({
            content: `✅ ${targetUser} a été sorti du SecureJail et ses rôles ont été restaurés.`
        });
    }
};
