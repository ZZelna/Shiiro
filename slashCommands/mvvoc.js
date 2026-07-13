const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("mvvoc")
        .setDescription("Déplace un ou plusieurs membres vers un salon vocal")
        .addChannelOption(option =>
            option
                .setName("salon")
                .setDescription("Salon vocal de destination")
                .addChannelTypes(ChannelType.GuildVoice, ChannelType.GuildStageVoice)
                .setRequired(true)
        )
        .addUserOption(option =>
            option
                .setName("utilisateur1")
                .setDescription("Membre à déplacer")
                .setRequired(false)
        )
        .addUserOption(option =>
            option
                .setName("utilisateur2")
                .setDescription("Membre à déplacer")
                .setRequired(false)
        )
        .addUserOption(option =>
            option
                .setName("utilisateur3")
                .setDescription("Membre à déplacer")
                .setRequired(false)
        )
        .addUserOption(option =>
            option
                .setName("utilisateur4")
                .setDescription("Membre à déplacer")
                .setRequired(false)
        )
        .addUserOption(option =>
            option
                .setName("utilisateur5")
                .setDescription("Membre à déplacer")
                .setRequired(false)
        )
        .addRoleOption(option =>
            option
                .setName("role")
                .setDescription("Déplace tous les membres de ce rôle actuellement en vocal")
                .setRequired(false)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.MoveMembers),

    async execute(interaction) {

        const targetChannel = interaction.options.getChannel("salon");
        const role = interaction.options.getRole("role");

        const explicitUsers = [1, 2, 3, 4, 5]
            .map(i => interaction.options.getUser(`utilisateur${i}`))
            .filter(Boolean);

        await interaction.deferReply({ ephemeral: true });

        // ─── Fusionne les utilisateurs explicites + les membres du rôle ─────
        const targets = new Map(); // userId -> { id, tag }

        for (const user of explicitUsers) {
            targets.set(user.id, user);
        }

        if (role) {
            // S'assure d'avoir le cache complet des membres pour filtrer par rôle
            await interaction.guild.members.fetch().catch(() => {});

            const roleMembers = interaction.guild.members.cache.filter(
                m => m.roles.cache.has(role.id) && m.voice.channelId
            );

            for (const member of roleMembers.values()) {
                targets.set(member.id, member.user);
            }
        }

        if (targets.size === 0) {
            return interaction.editReply({
                content: "❌ Aucun utilisateur trouvé (précise au moins un utilisateur ou un rôle avec des membres en vocal)."
            });
        }

        const moved = [];
        const failed = [];

        for (const user of targets.values()) {

            const member = await interaction.guild.members.fetch(user.id).catch(() => null);

            if (!member) {
                failed.push(`${user.tag} (introuvable sur le serveur)`);
                continue;
            }

            if (!member.voice.channelId) {
                failed.push(`${user.tag} (pas en vocal)`);
                continue;
            }

            if (member.voice.channelId === targetChannel.id) {
                continue; // déjà dans le bon salon
            }

            try {
                await member.voice.setChannel(targetChannel);
                moved.push(user.tag);
            } catch (err) {
                console.error(`❌ Erreur mvvoc pour ${user.tag} :`, err);
                failed.push(`${user.tag} (erreur : permissions ?)`);
            }
        }

        let response = "";

        if (moved.length) {
            response += `✅ Déplacé(s) vers ${targetChannel} : ${moved.join(", ")}\n`;
        }
        if (failed.length) {
            response += `❌ Échec : ${failed.join(", ")}`;
        }
        if (!response) {
            response = "❌ Aucun utilisateur valide fourni.";
        }

        return interaction.editReply({ content: response });
    }
};
