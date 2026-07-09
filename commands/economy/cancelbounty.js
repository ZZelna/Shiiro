const CasinoProfile = require("../../models/CasinoProfile");
const Bounty = require("../../models/Bounty");

const LOGS_CASINO = "1520766436388245585";
const BOUNTY_CHANNEL = "1519247019246616598";

module.exports = {
    name: "cancelbounty",

    async run(message, args) {

        const target = message.mentions.users.first();

        if (!target) {
            return message.reply(
                "❌ Utilisation : `*cancelbounty @utilisateur`"
            );
        }

        const bounty = await Bounty.findOne({
            targetId: target.id
        });

        if (!bounty) {
            return message.reply(
                `❌ Aucune prime active sur ${target}.`
            );
        }

        if (bounty.posterId !== message.author.id) {
            return message.reply(
                "❌ Tu n'es pas à l'origine de cette prime."
            );
        }

        const poster = await CasinoProfile.findOne({
            userId: message.author.id
        });

        if (poster) {
            poster.yens += bounty.amount;
            await poster.save();
        }

        try {

            const bountyChannel = message.guild.channels.cache.get(BOUNTY_CHANNEL);

            if (bountyChannel && bounty.messageId) {

                const bountyMsg = await bountyChannel.messages
                    .fetch(bounty.messageId)
                    .catch(() => null);

                if (bountyMsg) {
                    await bountyMsg.delete().catch(() => null);
                }

            }

        } catch (err) {

            console.error("Erreur suppression message bounty :", err);

        }

        await Bounty.deleteOne({
            targetId: target.id
        });

        await message.reply(
            `✅ Prime annulée sur ${target}. **${bounty.amount.toLocaleString()} ¥** ont été remboursés sur ton compte.`
        );

        try {

            const logsGuild = message.client.guilds.cache.find(g =>
                g.channels.cache.has(LOGS_CASINO)
            );

            const logsChannel = logsGuild?.channels.cache.get(LOGS_CASINO);

            if (logsChannel) {

                await logsChannel.send({
                    content:
                        "```diff\n" +
                        "- Prime annulée.\n" +
                        `Poseur: ${message.author.username} (ID: ${message.author.id})\n` +
                        `Cible: ${target.username} (ID: ${target.id})\n` +
                        `Montant remboursé: ${bounty.amount.toLocaleString()} ¥\n` +
                        "Action: Prime supprimée. ❌\n" +
                        "```"
                });

            }

        } catch (err) {

            console.error("Erreur logs cancelbounty :", err);

        }

    }
};
