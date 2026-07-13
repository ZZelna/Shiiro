const {
    ContainerBuilder,
    TextDisplayBuilder,
    MessageFlags
} = require("discord.js");

const CasinoProfile = require("../../models/CasinoProfile");
const updateClanYens = require("../../systems/updateClanYens");

const LOGS_CASINO = "1520766436388245585";

module.exports = {
    name: "work",

    async run(message) {

        const ALLOWED_CHANNEL = "1519055718416781412";

        if (message.channel.id !== ALLOWED_CHANNEL) {
            return message.reply(
                "❌ Cette commande est uniquement utilisable dans <#1519055718416781412>."
            );
        }

        const profile = await CasinoProfile.findOne({
            userId: message.author.id
        });

        if (!profile) {
            return message.reply(
                "❌ Tu n'as pas encore de profil casino."
            );
        }

        const cooldown = 20 * 60 * 1000;
        const now = Date.now();

        if (
            profile.lastClaim &&
            now - profile.lastClaim < cooldown
        ) {

            const remaining = Math.ceil(
                (cooldown - (now - profile.lastClaim)) / 60000
            );

            return message.reply(
                `⏳ Tu pourras refaire un claim dans **${remaining} min**.`
            );

        }

        const reward =
            Math.floor(Math.random() * (500 - 100 + 1)) + 100;

        profile.yens += reward;
        profile.lastClaim = now;

        await profile.save();

        try {
            await updateClanYens(
                message.author.id,
                reward
            );
        } catch (err) {
            console.error("[CLAN ERROR]", err);
        }

        const container = new ContainerBuilder()
            .setAccentColor(0xFFD700)
            .addTextDisplayComponents(
                new TextDisplayBuilder().setContent("## 💰 Claim Casino")
            )
            .addTextDisplayComponents(
                new TextDisplayBuilder().setContent(`Tu as gagné **${reward} ¥** !`)
            )
            .addTextDisplayComponents(
                new TextDisplayBuilder().setContent(
                    `💴 **Solde actuel**\n${profile.yens.toLocaleString()} ¥`
                )
            );

        await message.reply({
            components: [container],
            flags: MessageFlags.IsComponentsV2
        });

        // Log : reste en texte brut (staff-facing, inchangé)
        try {

            const logsGuild =
                message.client.guilds.cache.find(g =>
                    g.channels.cache.has(LOGS_CASINO)
                );

            const logsChannel =
                logsGuild?.channels.cache.get(LOGS_CASINO);

            if (logsChannel) {

                await logsChannel.send({
                    content:
                        "```diff\n" +
                        "- Claim effectué.\n" +
                        `Utilisateur: ${message.author.username} (ID: ${message.author.id})\n` +
                        `Récompense: ${reward} ¥\n` +
                        `Solde actuel: ${profile.yens.toLocaleString()} ¥\n` +
                        "Action: Yens crédités. 💰\n" +
                        "```"
                });

            }

        } catch (err) {
            console.error(err);
        }

    }
};
