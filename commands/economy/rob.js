const {
    EmbedBuilder
} = require("discord.js");

const CasinoProfile = require("../../models/CasinoProfile");
const Bounty = require("../../models/Bounty");

const COOLDOWN = 30 * 60 * 1000;
const LOGS_CASINO = "1520766436388245585";

module.exports = {
    name: "rob",

    async run(message, args) {

        const ALLOWED_CHANNEL = "1523677940750225508";

        if (message.channel.id !== ALLOWED_CHANNEL) {
            return message.reply(
                "❌ Cette commande est uniquement utilisable dans <#1523677940750225508>."
            );
        }

        const target = message.mentions.users.first();

        if (!target) {
            return message.reply(
                "❌ Utilisation : `*rob @utilisateur`"
            );
        }

        if (target.id === message.author.id) {
            return message.reply(
                "❌ Tu ne peux pas te piller toi-même."
            );
        }

        if (target.bot) {
            return message.reply(
                "❌ Tu ne peux pas piller un bot."
            );
        }

        const robber = await CasinoProfile.findOneAndUpdate(
            { userId: message.author.id },
            { $setOnInsert: { userId: message.author.id } },
            { upsert: true, new: true }
        );

        const now = Date.now();
              if (robber.lastRob && now - robber.lastRob < COOLDOWN) {

            const remaining = COOLDOWN - (now - robber.lastRob);
            const minutes = Math.floor(remaining / 60000);
            const seconds = Math.floor((remaining % 60000) / 1000);

            return message.reply(
                `⏳ Tu dois attendre encore **${minutes}m ${seconds}s** avant de piller à nouveau.`
            );

        }

        const victim = await CasinoProfile.findOne({
            userId: target.id
        });

        if (!victim) {
            return message.reply(
                `❌ ${target} n'a pas de profil casino.`
            );
        }

        if (victim.yens <= 0) {
            return message.reply(
                `❌ ${target} n'a pas de yens à voler.`
            );
        }

        const stolen = Math.min(
            Math.floor(Math.random() * 5001),
            victim.yens
        );

        victim.yens -= stolen;
        robber.yens += stolen;
        robber.lastRob = now;

        await victim.save();
        await robber.save();

        await message.reply({
            embeds: [
                new EmbedBuilder()
                    .setColor("DarkRed")
                    .setTitle("😈 Vol réussi !")
                    .setDescription(
                        `${message.author} a pillé **${stolen.toLocaleString()} ¥** à ${target} !`
                    )
            ]
        });

        const bounty = await Bounty.findOne({
            targetId: target.id
        });
              if (bounty && stolen >= bounty.amount) {

            robber.yens += bounty.amount;
            await robber.save();

            try {

                const bountyChannel = message.guild.channels.cache.get(
                    "1519247019246616598"
                );

                if (bountyChannel && bounty.messageId) {

                    const bountyMsg =
                        await bountyChannel.messages
                            .fetch(bounty.messageId)
                            .catch(() => null);

                    if (bountyMsg) {

                        const claimedEmbed =
                            new EmbedBuilder()
                                .setColor("DarkGreen")
                                .setTitle("✅ PRIME RÉCLAMÉE")
                                .setDescription(
                                    `La prime sur <@${target.id}> a été réclamée par ${message.author} !`
                                )
                                .addFields(
                                    {
                                        name: "🏆 Chasseur",
                                        value: `${message.author}`,
                                        inline: true
                                    },
                                    {
                                        name: "💴 Récompense",
                                        value: `\`${bounty.amount.toLocaleString()} ¥\``,
                                        inline: true
                                    },
                                    {
                                        name: "💰 Montant pillé",
                                        value: `\`${stolen.toLocaleString()} ¥\``,
                                        inline: true
                                    }
                                )
                                .setFooter({
                                    text: "Shiiro Casino • Bounty",
                                    iconURL: message.guild.iconURL()
                                })
                                .setTimestamp();

                        await bountyMsg.edit({
                            embeds: [claimedEmbed],
                            components: []
                        });

                    }

                }

            } catch (err) {

                console.error("Erreur update bounty message :", err);

            }

            await Bounty.deleteOne({
                targetId: target.id
            });

            await message.reply(
                `🎯 Tu as réclamé la prime sur ${target} ! **+${bounty.amount.toLocaleString()} ¥** ajoutés à ton compte.`
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
                            "+ Prime réclamée via pillage.\n" +
                            `Chasseur: ${message.author.username} (ID: ${message.author.id})\n` +
                            `Cible: ${target.username} (ID: ${target.id})\n` +
                            `Pillé: ${stolen.toLocaleString()} ¥\n` +
                            `Prime: ${bounty.amount.toLocaleString()} ¥\n` +
                            "Action: Yens transférés au chasseur. ✅\n" +
                            "```"
                    });

                }

            } catch (err) {

                console.error("Erreur logs bounty claim :", err);

            }

        }

        // Logs du vol
        try {

            const logsGuild = message.client.guilds.cache.find(g =>
                g.channels.cache.has(LOGS_CASINO)
            );

            const logsChannel = logsGuild?.channels.cache.get(LOGS_CASINO);

            if (logsChannel) {

                await logsChannel.send({
                    content:
                        "```diff\n" +
                        "- Vol effectué.\n" +
                        `Pilleur: ${message.author.username} (ID: ${message.author.id})\n` +
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
