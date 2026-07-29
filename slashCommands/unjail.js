const { SlashCommandBuilder } = require("discord.js");
const { isJailed, getJailEntry, deleteJailEntry } = require("../../utils/managers/jailStorage");
const logger = require("../utils/logger");
const logBuilder = require("../utils/logBuilder");
const logTypes = require("../utils/logTypes");

const MOD_ROLES = ["1517238655444451520", "1506674274826584284"];

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

        if (!(await isJailed(targetUser.id))) {
            return interaction.reply({
                content: "❌ Ce membre n'est pas en SecureJail.",
                ephemeral: true
            });
        }

        await interaction.deferReply({ ephemeral: true });

        const entry = await getJailEntry(targetUser.id);

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
        await deleteJailEntry(targetUser.id);

        // =========================
        // LOGS
        // =========================
        const logContent = logBuilder.build("SecureJail levé", [
            `👤 Cible      : ${targetUser.tag} (${targetUser.id})`,
            `👮 Modérateur : ${interaction.user.tag} (${interaction.user.id})`,
            `🗂️ Rôles restaurés : ${entry.roles.length}`
        ]);

        await logger.send(interaction.client, logTypes.JAIL, logContent);

        return interaction.editReply({
            content: `✅ ${targetUser} a été sorti du SecureJail et ses rôles ont été restaurés.`
        });
    }
};
