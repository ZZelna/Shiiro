const { EmbedBuilder } = require("discord.js");
const CasinoProfile = require("../models/CasinoProfile");

// ✅ ID du serveur principal
const MAIN_GUILD_ID = "1506672014679740546";

// Rôle donné automatiquement quand le statut /Shiiro est actif (voir presenceUpdate)
const STATUT_ROLE_ID = "1514348874427404529";

// Salon de logs pour les récompenses économie
const LOG_GUILD_ID = "1519364880677867550";
const LOG_CHANNEL_ID = "1523695742978494554";

function getLogChannel(client) {
    const logGuild = client.guilds.cache.get(LOG_GUILD_ID);
    if (!logGuild) return null;
    return logGuild.channels.cache.get(LOG_CHANNEL_ID) || null;
}

const MESSAGES_THRESHOLD = 10;
const REWARD_MESSAGES = 100;

const VOICE_BLOCK_MS = 30 * 60 * 1000; // 30 minutes
const REWARD_VOICE_BASE = 5000;
const REWARD_VOICE_STATUT = 5000; // bonus si le rôle statut est actif au moment du palier

async function addYens(userId, amount) {
    let profile = await CasinoProfile.findOne({ userId });

    if (!profile) {
        profile = await CasinoProfile.create({ userId });
    }

    const boostActive =
        profile.boostEnd &&
        profile.boostEnd > new Date();

    const multiplier = boostActive
        ? profile.boostMultiplier
        : 1;

    const finalAmount = Math.round(amount * multiplier);

    profile.yens += finalAmount;

    await profile.save();

    return {
        total: profile.yens,
        gained: finalAmount,
        boostActive,
        multiplier
    };
}

module.exports = function economyRewards(client) {

    // ─────────────────────────────────────────────
    // Récompenses messages
    // ─────────────────────────────────────────────

    const messageCounts = new Map();

    client.on("messageCreate", async (message) => {

        if (message.author.bot) return;
        if (!message.guild) return;

        // ✅ Uniquement sur le serveur principal
        if (message.guild.id !== MAIN_GUILD_ID) return;

        const userId = message.author.id;

        const count =
            (messageCounts.get(userId) || 0) + 1;

        if (count >= MESSAGES_THRESHOLD) {

            messageCounts.set(userId, 0);

            try {

                const result =
                    await addYens(userId, REWARD_MESSAGES);

                const logChannel =
                    getLogChannel(client);

                if (logChannel) {

                    const embed = new EmbedBuilder()
                        .setColor("Gold")
                        .setTitle("💬 Récompense Messages")
                        .setDescription(
                            `${message.author} a gagné **${result.gained} yens** (10 messages envoyés).`
                        )
                        .addFields(
                            {
                                name: "💰 Nouveau solde",
                                value: `${result.total} yens`,
                                inline: true
                            },
                            {
                                name: "🚀 Boost actif",
                                value: result.boostActive
                                    ? `x${result.multiplier}`
                                    : "Non",
                                inline: true
                            }
                        )
                        .setTimestamp();

                    logChannel
                        .send({ embeds: [embed] })
                        .catch(() => {});
                }

            } catch (err) {

                console.error(
                    "❌ Erreur récompense messages :",
                    err
                );

            }

        } else {

            messageCounts.set(userId, count);

        }

    });

    // ─────────────────────────────────────────────
    // Récompenses vocal
    // ─────────────────────────────────────────────

    const voiceJoinTimes = new Map();
    const voiceRewardedBlocks = new Map();

    client.on("voiceStateUpdate", (oldState, newState) => {

        const member =
            newState.member || oldState.member;

        if (!member) return;
        if (member.user.bot) return;

        // ✅ Uniquement sur le serveur principal
        if (member.guild.id !== MAIN_GUILD_ID) return;

        const userId = member.id;

        if (!oldState.channelId && newState.channelId) {

            voiceJoinTimes.set(userId, Date.now());
            voiceRewardedBlocks.set(userId, 0);

        }

        if (oldState.channelId && !newState.channelId) {

            voiceJoinTimes.delete(userId);
            voiceRewardedBlocks.delete(userId);

        }

    });
        // Vérifie chaque minute les paliers de 30 minutes
    setInterval(async () => {

        const guild = client.guilds.cache.get(MAIN_GUILD_ID);
        if (!guild) return;

        for (const [userId, joinTime] of voiceJoinTimes.entries()) {

            const elapsed = Date.now() - joinTime;

            const blocksEarned =
                Math.floor(elapsed / VOICE_BLOCK_MS);

            const alreadyRewarded =
                voiceRewardedBlocks.get(userId) || 0;

            if (blocksEarned <= alreadyRewarded) continue;

            const newBlocks =
                blocksEarned - alreadyRewarded;

            voiceRewardedBlocks.set(
                userId,
                blocksEarned
            );

            const member =
                await guild.members
                    .fetch(userId)
                    .catch(() => null);

            if (!member) continue;

            const hasStatut =
                member.roles.cache.has(STATUT_ROLE_ID);

            const rewardPerBlock =
                REWARD_VOICE_BASE +
                (hasStatut
                    ? REWARD_VOICE_STATUT
                    : 0);

            const totalReward =
                rewardPerBlock * newBlocks;

            try {

                const result =
                    await addYens(
                        userId,
                        totalReward
                    );

                const logChannel =
                    getLogChannel(client);

                if (logChannel) {

                    const embed =
                        new EmbedBuilder()
                            .setColor("Aqua")
                            .setTitle("🎙️ Récompense Vocal")
                            .setDescription(
                                `${member} a gagné **${result.gained} yens** (${newBlocks} palier(s) de 30 min).`
                            )
                            .addFields(
                                {
                                    name: "📌 Statut /Shiiro actif",
                                    value: hasStatut
                                        ? "Oui (+5000/palier)"
                                        : "Non",
                                    inline: true
                                },
                                {
                                    name: "💰 Nouveau solde",
                                    value: `${result.total} yens`,
                                    inline: true
                                },
                                {
                                    name: "🚀 Boost actif",
                                    value: result.boostActive
                                        ? `x${result.multiplier}`
                                        : "Non",
                                    inline: true
                                }
                            )
                            .setTimestamp();

                    logChannel
                        .send({
                            embeds: [embed]
                        })
                        .catch(() => {});
                }

            } catch (err) {

                console.error(
                    "❌ Erreur récompense vocal :",
                    err
                );

            }

        }

    }, 60 * 1000);

};
