const {
    TICKET_CATEGORIES,
    renameCooldowns,
    RENAME_COOLDOWN_MS,
    LOG_CHANNEL_ID,
    sanitizeSlug,
    getCategoryKey
} = require("../../handlers/systems/ticketHandler");

module.exports = {
    name: "rename",
    async run(message, args) {

        const isTicket = Object.values(TICKET_CATEGORIES).some(
            cat => cat.categoryId === message.channel.parentId
        );

        if (!isTicket) {
            return message.reply("❌ Cette commande ne fonctionne que dans un salon ticket.");
        }

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

        if (!args.length) {
            return message.reply("❌ Utilisation : `+rename nouveau-nom`");
        }

        const lastRename = renameCooldowns.get(message.channel.id);

        if (lastRename && Date.now() - lastRename < RENAME_COOLDOWN_MS) {
            const remaining = Math.ceil(
                (RENAME_COOLDOWN_MS - (Date.now() - lastRename)) / 1000 / 60
            );
            return message.reply(`❌ Ce ticket a déjà été renommé récemment. Réessaie dans ~${remaining} min.`);
        }

        const sanitized = sanitizeSlug(args.join("-"));

        if (!sanitized) {
            return message.reply("❌ Nom invalide.");
        }

        const categoryKey = getCategoryKey(message.channel.parentId);
        const finalName = `ticket-${categoryKey}-${sanitized}`;

        try {
            await message.channel.setName(finalName);

            renameCooldowns.set(message.channel.id, Date.now());

            await message.reply(`✅ Ticket renommé en \`${finalName}\`.`);

            const logChannel = message.guild.channels.cache.get(LOG_CHANNEL_ID);
            if (logChannel) {
                await logChannel.send({
                    content: `✏️ Ticket renommé en **${finalName}** par ${message.author} (commande préfixe).`
                });
            }
        } catch (err) {
            console.error("❌ Erreur rename ticket (préfixe) :", err);
            return message.reply("❌ Impossible de renommer ce salon (limite Discord atteinte : max 2 renommages toutes les 10 min).");
        }
    }
};
