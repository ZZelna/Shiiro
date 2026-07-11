const {
    TICKET_CATEGORIES,
    renameCooldowns,
    RENAME_COOLDOWN_MS,
    LOG_CHANNEL_ID
} = require("../../handlers/systems/ticketHandler");

module.exports = {
    name: "rename",
    async run(message, args) {

        // ─── Vérifie que le salon est bien un ticket ─────────────────────
        const isTicket = Object.values(TICKET_CATEGORIES).some(
            cat => cat.categoryId === message.channel.parentId
        );

        if (!isTicket) {
            return message.reply("❌ Cette commande ne fonctionne que dans un salon ticket.");
        }

        // ─── Vérifie que l'utilisateur est staff ou propriétaire du ticket ─
        const category = Object.values(TICKET_CATEGORIES).find(
            cat => cat.categoryId === message.channel.parentId
        );

        const isOwner = message.channel.topic === message.author.id;
        const isStaff = category.staffRoles.some(roleId =>
            message.member.roles.cache.has(roleId)
        );

        if (!isOwner && !isStaff) {
            return message.reply("❌ Tu n'as pas la permission de renommer ce ticket.");
        }

        // ─── Vérifie le nom fourni ────────────────────────────────────────
        if (!args.length) {
            return message.reply("❌ Utilisation : `+rename nouveau-nom`");
        }

        // ─── Vérifie le cooldown (partagé avec le bouton) ──────────────────
        const lastRename = renameCooldowns.get(message.channel.id);

        if (lastRename && Date.now() - lastRename < RENAME_COOLDOWN_MS) {
            const remaining = Math.ceil(
                (RENAME_COOLDOWN_MS - (Date.now() - lastRename)) / 1000 / 60
            );
            return message.reply(`❌ Ce ticket a déjà été renommé récemment. Réessaie dans ~${remaining} min.`);
        }

        // ─── Nettoyage du nom ───────────────────────────────────────────────
        const sanitized = args
            .join("-")
            .toLowerCase()
            .replace(/\s+/g, "-")
            .replace(/[^a-z0-9-]/g, "")
            .slice(0, 90);

        if (!sanitized) {
            return message.reply("❌ Nom invalide.");
        }

        // ─── Application du renommage ────────────────────────────────────────
        try {
            await message.channel.setName(sanitized);

            renameCooldowns.set(message.channel.id, Date.now());

            await message.reply(`✅ Ticket renommé en \`${sanitized}\`.`);

            const logChannel = message.guild.channels.cache.get(LOG_CHANNEL_ID);
            if (logChannel) {
                await logChannel.send({
                    content: `✏️ Ticket renommé en **${sanitized}** par ${message.author} (commande préfixe).`
                });
            }
        } catch (err) {
            console.error("❌ Erreur rename ticket (préfixe) :", err);
            return message.reply("❌ Impossible de renommer ce salon (limite Discord atteinte : max 2 renommages toutes les 10 min).");
        }
    }
};
