const {
    EmbedBuilder
} = require("discord.js");

const CasinoProfile = require("../../models/CasinoProfile");
const Coffre = require("../../models/Coffre");

const COOLDOWN = 30 * 60 * 1000;
const MAX_HITS = 10000;
const TOTAL_YENS = 5000000;

function buildProgressBar(current, max, length = 20) {
    const filled = Math.round((current / max) * length);
    const empty = length - filled;

    return "🟥".repeat(filled) + "⬛".repeat(empty);
}

module.exports = {
    name: "attack",

    async run(message) {

        const ALLOWED_CHANNEL = "1519055718416781412";

        if (message.channel.id !== ALLOWED_CHANNEL) {
            return message.reply(
                "❌ Cette commande est uniquement utilisable dans <#1519055718416781412>."
            );
        }

        const user = await CasinoProfile.findOne({
            userId: message.author.id
        });

        if (!user) {
            return message.reply(
                "❌ Tu n'as pas de profil casino. Utilise **/casino** pour en créer un."
            );
        }

        const coffre = await Coffre.findOne();

        if (!coffre) {
            return message.reply(
                "❌ Aucun coffre n'est actuellement actif. Un administrateur doit lancer **/startcoffre**."
            );
        }

        if (coffre.destroyed) {
            return message.reply(
                "❌ Ce coffre a déjà été détruit. Attendez qu'un nouveau coffre soit lancé."
            );
        }

        const now = Date.now();

        const participant = coffre.participants.get(message.author.id) ?? {
            hits: 0,
            lastAttack: 0
        };
                if (now - participant.lastAttack < COOLDOWN) {

            const remaining = COOLDOWN - (now - participant.lastAttack);
            const minutes = Math.floor(remaining / 60000);
            const seconds = Math.floor((remaining % 60000) / 1000);

            return message.reply(
                `⏳ Tu dois attendre encore **${minutes}m ${seconds}s** avant d'attaquer à nouveau.`
            );
        }

        // Attaque
        participant.hits += 1;
        participant.lastAttack = now;

        coffre.participants.set(message.author.id, participant);
        coffre.totalHits += 1;

        coffre.markModified("participants");

        const percent = Math.min(
            (coffre.totalHits / MAX_HITS) * 100,
            100
        ).toFixed(1);

        const progressBar = buildProgressBar(
            coffre.totalHits,
            MAX_HITS
        );

        // Coffre détruit ?
        if (coffre.totalHits >= MAX_HITS) {

            coffre.destroyed = true;

            await coffre.save();

            const rewards = [];
                        for (const [userId, data] of coffre.participants) {

                const share = Math.floor(
                    (data.hits / MAX_HITS) * TOTAL_YENS
                );

                const profile = await CasinoProfile.findOne({
                    userId
                });

                if (!profile) continue;

                profile.yens += share;
                await profile.save();

                rewards.push(
                    `<@${userId}> — **${data.hits} frappes** → **${share.toLocaleString()} Yens**`
                );

            }

            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor("Gold")
                        .setTitle("💥 Coffre détruit !")
                        .setDescription(
                            `Le coffre a été détruit après **${MAX_HITS.toLocaleString()} frappes** !\n\n` +
                            `💰 **Répartition des ${TOTAL_YENS.toLocaleString()} Yens :**\n\n` +
                            rewards.join("\n")
                        )
                ]
            });

        }

        await coffre.save();
                return message.reply({
            embeds: [
                new EmbedBuilder()
                    .setColor("Orange")
                    .setTitle("⚔️ Attaque !")
                    .setDescription(
                        `${message.author} frappe le coffre !\n\n` +
                        `${progressBar}\n` +
                        `**${coffre.totalHits.toLocaleString()} / ${MAX_HITS.toLocaleString()} frappes** (${percent}%)\n\n` +
                        `🥊 Tu as frappé **${participant.hits} fois** au total.`
                    )
            ]
        });

    }
};
