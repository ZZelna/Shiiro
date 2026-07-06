const CasinoProfile = require("../models/CasinoProfile");

// Rôle donné automatiquement quand le statut /Shiiro est actif (voir presenceUpdate)
const STATUT_ROLE_ID = "1514348874427404529";

const MESSAGES_THRESHOLD = 10;
const REWARD_MESSAGES = 100;

const VOICE_BLOCK_MS = 30 * 60 * 1000; // 30 minutes
const REWARD_VOICE_BASE = 5000;
const REWARD_VOICE_STATUT = 5000; // bonus si le rôle statut est actif au moment du palier

async function addYens(userId, amount) {
    let profile = await CasinoProfile.findOne({ userId });
    if (!profile) profile = await CasinoProfile.create({ userId });

    // Applique le boost actif s'il y en a un
    const boostActive = profile.boostEnd && profile.boostEnd > new Date();
    const multiplier = boostActive ? profile.boostMultiplier : 1;

    const finalAmount = Math.round(amount * multiplier);

    profile.yens += finalAmount;
    await profile.save();
    return { total: profile.yens, gained: finalAmount, boostActive, multiplier };
}

module.exports = function economyRewards(client) {

    // ─── Récompense messages (tous les 10 messages) ───

    const messageCounts = new Map();

    client.on("messageCreate", async (message) => {
        if (message.author.bot) return;
        if (!message.guild) return;

        const userId = message.author.id;
        const count = (messageCounts.get(userId) || 0) + 1;

        if (count >= MESSAGES_THRESHOLD) {
            messageCounts.set(userId, 0);
            try {
                await addYens(userId, REWARD_MESSAGES);
            } catch (err) {
                console.error("❌ Erreur récompense messages :", err);
            }
        } else {
            messageCounts.set(userId, count);
        }
    });

    // ─── Récompense vocal (toutes les 30 min, + bonus si statut actif) ───

    const voiceJoinTimes = new Map();      // userId -> timestamp de connexion (session en cours)
    const voiceRewardedBlocks = new Map(); // userId -> nombre de paliers de 30min déjà payés

    client.on("voiceStateUpdate", (oldState, newState) => {
        const member = newState.member || oldState.member;
        if (!member || member.user.bot) return;

        const userId = member.id;

        // Rejoint un vocal (n'était dans aucun vocal avant)
        if (!oldState.channelId && newState.channelId) {
            voiceJoinTimes.set(userId, Date.now());
            voiceRewardedBlocks.set(userId, 0);
        }

        // Quitte le vocal complètement (déconnexion totale)
        if (oldState.channelId && !newState.channelId) {
            voiceJoinTimes.delete(userId);
            voiceRewardedBlocks.delete(userId);
        }
    });

    // Vérifie chaque minute si un palier de 30 min a été franchi
    setInterval(async () => {
        for (const [userId, joinTime] of voiceJoinTimes.entries()) {
            const elapsed = Date.now() - joinTime;
            const blocksEarned = Math.floor(elapsed / VOICE_BLOCK_MS);
            const alreadyRewarded = voiceRewardedBlocks.get(userId) || 0;

            if (blocksEarned > alreadyRewarded) {
                const newBlocks = blocksEarned - alreadyRewarded;
                voiceRewardedBlocks.set(userId, blocksEarned);

                for (const guild of client.guilds.cache.values()) {
                    const member = await guild.members.fetch(userId).catch(() => null);
                    if (!member) continue;

                    const hasStatut = member.roles.cache.has(STATUT_ROLE_ID);
                    const rewardPerBlock = REWARD_VOICE_BASE + (hasStatut ? REWARD_VOICE_STATUT : 0);
                    const totalReward = rewardPerBlock * newBlocks;

                    try {
                        await addYens(userId, totalReward);
                        console.log(`💰 ${userId} a reçu ${totalReward} yens (vocal, statut: ${hasStatut})`);
                    } catch (err) {
                        console.error("❌ Erreur récompense vocal :", err);
                    }

                    break; // un membre trouvé dans un serveur suffit
                }
            }
        }
    }, 60 * 1000);
};
