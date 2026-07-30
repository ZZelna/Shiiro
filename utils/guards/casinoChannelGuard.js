 const { getCasinoChannels } = require("../managers/casinoChannelManager");

/**
 * Vérifie que la commande/interaction est utilisée dans un salon casino autorisé.
 * Fonctionne aussi bien avec une interaction (slash, bouton...) qu'un message (préfixe).
 * Répond déjà à l'utilisateur en cas de refus. Retourne true si autorisé, false sinon.
 *
 * Ne pas utiliser sur les commandes de mini-jeux (guessmusique, guessartiste, etc.),
 * qui restent utilisables partout.
 */
async function checkCasinoChannel(ctx) {
    const guildId = ctx.guild.id;
    const channelId = ctx.channel?.id ?? ctx.channelId;
    const allowed = await getCasinoChannels(guildId);

    const isInteraction = typeof ctx.isRepliable === "function";

    if (!allowed.length) {
        const text = "❌ Aucun salon casino n'est configuré. Un modérateur doit utiliser **/casinosalon**.";
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

module.exports = { checkCasinoChannel };
