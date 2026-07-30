const { getGameChannels } = require("../managers/gameChannelManager");

/**
 * Vérifie que la commande/interaction est utilisée dans un salon jeux autorisé
 * (blackjack, pile ou face). Fonctionne avec une interaction (slash, bouton...)
 * ou un message (préfixe). Répond déjà à l'utilisateur en cas de refus.
 * Retourne true si autorisé, false sinon.
 */
async function checkGameChannel(ctx) {
    const guildId = ctx.guild.id;
    const channelId = ctx.channel?.id ?? ctx.channelId;
    const allowed = await getGameChannels(guildId);

    const isInteraction = typeof ctx.isRepliable === "function";

    if (!allowed.length) {
        const text = "❌ Aucun salon de jeux n'est configuré. Un modérateur doit utiliser **/jeuxsalon**.";
        if (isInteraction) {
            await ctx.reply({ content: text, ephemeral: true }).catch(() => {});
        } else {
            await ctx.reply(text).catch(() => {});
        }
        return false;
    }

    if (!allowed.includes(channelId)) {
        const text = `❌ Cette commande est uniquement utilisable dans : ${allowed.map(id => `<#${id}>`).join(", ")}`;
        if (isInteraction) {
            await ctx.reply({ content: text, ephemeral: true }).catch(() => {});
        } else {
            await ctx.reply(text).catch(() => {});
        }
        return false;
    }

    return true;
}

module.exports = { checkGameChannel };
