const {
    SlashCommandBuilder,
    EmbedBuilder
} = require("discord.js");

const CasinoProfile = require("../models/CasinoProfile");

const COOLDOWN = 30 * 60 * 1000;
const LOGS_CASINO = "1520766436388245585";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("rob")
        .setDescription("Pille les yens d'un membre.")
        .addUserOption(option =>
            option.setName("membre")
                .setDescription("Le membre à piller.")
                .setRequired(true)
        ),

    async execute(interaction) {
        const target = interaction.options.getUser("membre");

        if (target.id === interaction.user.id) {
            return interaction.reply({
                content: "❌ Tu ne peux pas te piller toi-même.",
                ephemeral: true
            });
        }

        if (target.bot) {
            return interaction.reply({
                content: "❌ Tu ne peux pas piller un bot.",
                ephemeral: true
            });
        }

        // ✅ upsert pour éviter le "pas de profil" si l'user n'a jamais joué
        const robber = await CasinoProfile.findOneAndUpdate(
            { userId: interaction.user.id },
            { $setOnInsert: { userId: interaction.user.id } },
            { upsert: true, new: true }
        );

        const now = Date.now();

        // ✅ CORRIGÉ : lastRob au lieu de lastClaim
        if (robber.lastRob && now - robber.lastRob < COOLDOWN) {
            const remaining = COOLDOWN - (now - robber.lastRob);
            const minutes = Math.floor(remaining / 60000);
            const seconds = Math.floor((remaining % 60000) / 1000);
            return interaction.reply({
                content: `⏳ Tu dois attendre encore **${minutes}m ${seconds}s** avant de piller à nouveau.`,
                ephemeral: true
            });
        }

        const victim = await CasinoProfile.findOne({ userId: target.id });

        if (!victim) {
            return interaction.reply({
                content: `❌ ${target} n'a pas de profil casino.`,
                ephemeral: true
            });
        }

        if (victim.yens <= 0) {
            return interaction.reply({
                content: `❌ ${target} n'a pas de yens à voler.`,
                ephemeral: true
            });
        }

        const stolen = Math.min(Math.floor(Math.random() * 5001), victim.yens);

        victim.yens -= stolen;
        robber.yens += stolen;

        // ✅ CORRIGÉ : lastRob au lieu de lastClaim
        robber.lastRob = now;

        await victim.save();
        await robber.save();

        await interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setColor("DarkRed")
                    .setTitle("😈 Vol réussi !")
                    .setDescription(`${interaction.user} a pillé **${stolen.toLocaleString()} ¥** à ${target} !`)
            ]
        });

        // ✅ CORRIGÉ : logs bien formatés
        try {
            const logsGuild = interaction.client.guilds.cache.find(g =>
                g.channels.cache.has(LOGS_CASINO)
            );
            const logsChannel = logsGuild?.channels.cache.get(LOGS_CASINO);
            if (logsChannel) {
                await logsChannel.send({
                    content:
                        "```diff\n" +
                        "- Vol effectué.\n" +
                        `Pilleur: ${interaction.user.username} (ID: ${interaction.user.id})\n` +
                        `Victime: ${target.username} (ID: ${target.id})\n` +
                        `Montant volé: ${stolen.toLocaleString()} ¥\n` +
                        "Action: Yens transférés. 😈\n" +
                        "```"
                });
            }
        } catch (err) {
            console.error("Erreur logs rob :", err);
        }
    }
};
