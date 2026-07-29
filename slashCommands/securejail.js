const {
    SlashCommandBuilder,
    PermissionFlagsBits,
    ChannelType,
    ContainerBuilder,
    TextDisplayBuilder,
    SeparatorBuilder,
    SeparatorSpacingSize,
    MessageFlags
} = require("discord.js");
const { isJailed, setJailEntry, updateJailEntry } = require("../utils/managers/jailStorage");
const logger = require("../../utils/logger");
const logBuilder = require("../../utils/logBuilder");
const logTypes = require("../../utils/logTypes");
const colors = require("../../utils/colors");

const MOD_ROLES = ["1517238655444451520", "1506674274826584284"];
const JAIL_ROLE_ID = "1508842233619677306";
const JAIL_CATEGORY_ID = "1519335515797586160";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("securejail")
        .setDescription("Isole un membre dans un salon SecureJail.")
        .addUserOption(opt =>
            opt.setName("membre")
                .setDescription("Le membre à jail")
                .setRequired(true)
        )
        .addStringOption(opt =>
            opt.setName("raison")
                .setDescription("Raison de la sanction")
                .setRequired(false)
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

        const target = interaction.options.getMember("membre");
        const reason = interaction.options.getString("raison") || "Aucune raison fournie";

        if (!target) {
            return interaction.reply({
                content: "❌ Membre introuvable sur ce serveur.",
                ephemeral: true
            });
        }

        // =========================
        // DÉJÀ EN SECUREJAIL ?
        // =========================
        if ((await isJailed(target.id)) || target.roles.cache.has(JAIL_ROLE_ID)) {
            return interaction.reply({
                content: "❌ Ce membre est déjà en SecureJail.",
                ephemeral: true
            });
        }

        // =========================
        // MEMBRE PROTÉGÉ ?
        // =========================
        const isAdmin = target.permissions.has(PermissionFlagsBits.Administrator);
        const isProtectedStaff = MOD_ROLES.some(roleId => target.roles.cache.has(roleId));
        const isHierarchyIssue =
            target.roles.highest.position >= interaction.member.roles.highest.position;

        if (isAdmin || isProtectedStaff || isHierarchyIssue) {
            return interaction.reply({
                content: "❌ Ce membre est protégé et ne peut pas être jail (administrateur, staff, ou hiérarchie).",
                ephemeral: true
            });
        }

        await interaction.deferReply({ ephemeral: true });

        // =========================
        // SAUVEGARDE DES RÔLES
        // =========================
        const savedRoles = target.roles.cache
            .filter(r => r.id !== interaction.guild.id && !r.managed) // on exclut @everyone et les rôles managed (booster, bots, intégrations)
            .map(r => r.id);

        // Les rôles managed (ex: Server Booster) ne peuvent pas être retirés via l'API
        // et sont gérés automatiquement par Discord — on les laisse en place.
        const managedRoleIds = target.roles.cache
            .filter(r => r.managed)
            .map(r => r.id);

        await setJailEntry(target.id, {
            roles: savedRoles,
            date: new Date().toISOString(),
            moderatorId: interaction.user.id,
            reason,
            channelId: null
        });

        // =========================
        // ISOLEMENT DU MEMBRE
        // =========================
        try {
            await target.roles.set([JAIL_ROLE_ID, ...managedRoleIds]);
        } catch (err) {
            console.error("Erreur lors du retrait des rôles :", err);
            return interaction.editReply({
                content: "❌ Impossible de modifier les rôles de ce membre (permissions/hiérarchie)."
            });
        }

        // =========================
        // CRÉATION DU SALON
        // =========================
        let jailChannel;
        try {
            jailChannel = await interaction.guild.channels.create({
                name: `jail-${target.user.username}`,
                type: ChannelType.GuildText,
                parent: JAIL_CATEGORY_ID,
                permissionOverwrites: [
                    {
                        id: interaction.guild.id,
                        deny: [PermissionFlagsBits.ViewChannel]
                    },
                    {
                        id: target.id,
                        allow: [
                            PermissionFlagsBits.ViewChannel,
                            PermissionFlagsBits.SendMessages,
                            PermissionFlagsBits.ReadMessageHistory
                        ]
                    },
                    ...MOD_ROLES.map(roleId => ({
                        id: roleId,
                        allow: [
                            PermissionFlagsBits.ViewChannel,
                            PermissionFlagsBits.SendMessages,
                            PermissionFlagsBits.ReadMessageHistory
                        ]
                    }))
                ]
            });
        } catch (err) {
            console.error("Erreur lors de la création du salon jail :", err);
            return interaction.editReply({
                content: "⚠️ Le membre a été isolé mais le salon n'a pas pu être créé."
            });
        }

        await updateJailEntry(target.id, { channelId: jailChannel.id });

        // =========================
        // MESSAGE DANS LE SALON (V2 — user-facing)
        // =========================
        const jailContainer = new ContainerBuilder()
            .setAccentColor(colors.MODERATION)
            .addTextDisplayComponents(
                new TextDisplayBuilder().setContent(`# 🔒 SecureJail`)
            )
            .addSeparatorComponents(
                new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
            )
            .addTextDisplayComponents(
                new TextDisplayBuilder().setContent(
                    `${target} <@&${MOD_ROLES[0]}>\n\n` +
                    `**Modérateur :** ${interaction.user}\n` +
                    `**Raison :** ${reason}\n\n` +
                    `Seul un modérateur peut lever cette sanction avec \`/unjail\`.`
                )
            );

        await jailChannel.send({
            components: [jailContainer],
            flags: MessageFlags.IsComponentsV2,
            allowedMentions: { parse: ["users", "roles"] }
        });

        // =========================
        // LOGS
        // =========================
        const logContent = logBuilder.build("Membre placé en SecureJail", [
            logBuilder.member(target),
            `🛡️ Modérateur : ${interaction.user.tag} (${interaction.user.id})`,
            `📋 Raison     : ${reason}`,
            logBuilder.channel(jailChannel),
            `🗂️ Rôles sauvegardés : ${savedRoles.length}`
        ]);

        await logger.send(interaction.client, logTypes.JAIL, logContent);

        return interaction.editReply({
            content: `✅ ${target} a été placé en SecureJail dans ${jailChannel}.`
        });
    }
};
