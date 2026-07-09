const {
    SlashCommandBuilder,
    EmbedBuilder
} = require("discord.js");

const CasinoProfile = require("../models/CasinoProfile");
const Coffre = require("../models/Coffre");

const COOLDOWN = 30 * 60 * 1000;
const MAX_HITS = 10000;
const TOTAL_YENS = 5000000;

function buildProgressBar(current, max, length = 20) {
    const filled = Math.round((current / max) * length);
    const empty = length - filled;

    return "🟥".repeat(filled) + "⬛".repeat(empty);
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName("attack")
        .setDescription("Attaque le coffre pour gagner des yens !"),

    async execute(interaction) {

        const ALLOWED_CHANNEL = "1519055718416781412";

        if (interaction.channelId !== ALLOWED_CHANNEL) {
            return interaction.reply({
                content: "❌ Cette commande est uniquement utilisable dans <#1523677940750225508>.",
                ephemeral: true
            });
        }

        const user = await CasinoProfile.findOne({
            userId: interaction.user.id
        });

        if (!user) {
            return interaction.reply({
                content: "❌ Tu n'as pas de profil casino. Utilise `/casino` pour en créer un.",
                ephemeral: true
            });
        }

        const
         coffre = await Coffre.findOne();

        if (!coffre) {
            return interaction.reply({
                content: "❌ Aucun coffre n'est actuellement actif. Utilise `/startcoffre`.",
                ephemeral: true
            });
        }

        if (coffre.destroyed) {
            return interaction.reply({
                content: "❌ Ce coffre a déjà été détruit. Attendez qu'un nouveau coffre soit lancé.",
                ephemeral: true
            });
        }
             // Cooldown
        const now = Date.now();

        const participant = coffre.participants.get(interaction.user.id) ?? {
            hits: 0,
            lastAttack: 0
        };

        if (now - participant.lastAttack < COOLDOWN) {

            const remaining = COOLDOWN - (now - participant.lastAttack);
            const minutes = Math.floor(remaining / 60000);
            const seconds = Math.floor((remaining % 60000) / 1000);

            return interaction.reply({
                content: `⏳ Tu dois attendre encore **${minutes}m ${seconds}s** avant d'attaquer à nouveau.`,
                ephemeral: true
            });

        }

        // Attaque
        participant.hits += 1;
        participant.lastAttack = now;

        coffre.participants.set(interaction.user.id, participant);
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

            return interaction.reply({
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

        return interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setColor("Orange")
                    .setTitle("⚔️ Attaque !")
                    .setDescription(
                        `${interaction.user} frappe le coffre !\n\n` +
                        `${progressBar}\n` +
                        `**${coffre.totalHits.toLocaleString()} / ${MAX_HITS.toLocaleString()} frappes** (${percent}%)\n\n` +
                        `🥊 Tu as frappé **${participant.hits} fois** au total.`
                    )
            ]
        });

    }
};
