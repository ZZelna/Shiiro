const {
    EmbedBuilder
} = require("discord.js");

const CasinoProfile = require("../../models/CasinoProfile");
const Bounty = require("../../models/Bounty");

const BOUNTY_CHANNEL = "1519247019246616598";
const LOGS_CASINO = "1520766436388245585";

module.exports = {
    name: "bounty",

    async run(message, args) {

        const ALLOWED_CHANNEL = "1519247019246616598";

        if (message.channel.id !== ALLOWED_CHANNEL) {
            return message.reply(
                "❌ Cette commande est uniquement utilisable dans <#1519247019246616598>."
            );
        }

        const target = message.mentions.users.first();

        if (!target) {
            return message.reply(
                "❌ Utilisation : `*bounty @utilisateur montant`"
            );
        }

        const amount = parseInt(args[1]);

        if (!amount || amount < 1000) {
            return message.reply(
                "❌ Le montant minimum est de **1 000 ¥**."
            );
        }

        if (target.id === message.author.id) {
            return message.reply(
                "❌ Tu ne peux pas poser une prime sur toi-même."
            );
        }

        if (target.bot) {
            return message.reply(
                "❌ Tu ne peux pas poser une prime sur un bot."
            );
        }

        const existing = await Bounty.findOne({
            targetId: target.id
        });

        if (existing) {
            return message.reply(
                `❌ Une prime est déjà active sur ${target} (**${existing.amount.toLocaleString()} ¥**).`
            );
        }

        const poster = await CasinoProfile.findOne({
            userId: message.author.id
        });

        if (!poster || poster.yens < amount) {
            return message.reply(
                `❌ Solde insuffisant. Tu possèdes **${(poster?.yens ?? 0).toLocaleString()} ¥**.`
            );
        }

        poster.yens -= amount;
        await poster.save();
                const bountyChannel = message.guild.channels.cache.get(BOUNTY_CHANNEL);

        if (!bountyChannel) {
            return message.reply(
                "❌ Salon des primes introuvable."
            );
        }

        const embed = new EmbedBuilder()
            .setColor("DarkRed")
            .setTitle("🎯 PRIME ACTIVE")
            .setDescription(
                `Une prime a été posée sur **${target}** !\n` +
                `Pille cette personne d'au moins **${amount.toLocaleString()} ¥** pour la réclamer automatiquement.`
            )
            .addFields(
                {
                    name: "🎯 Cible",
                    value: `${target}`,
                    inline: true
                },
                {
                    name: "💴 Récompense",
                    value: `\`${amount.toLocaleString()} ¥\``,
                    inline: true
                },
                {
                    name: "📌 Posée par",
                    value: `${message.author}`,
                    inline: true
                }
            )
            .setThumbnail(target.displayAvatarURL({ forceStatic: false }))
            .setFooter({
                text: "Shiiro Casino • Bounty — Pillage requis pour réclamer",
                iconURL: message.guild.iconURL()
            })
            .setTimestamp();

        const bountyMessage = await bountyChannel.send({
            embeds: [embed]
        });

        await Bounty.create({
            targetId: target.id,
            posterId: message.author.id,
            amount,
            messageId: bountyMessage.id
        });

        await message.reply(
            `✅ Prime de **${amount.toLocaleString()} ¥** posée sur ${target} !\n` +
            `Elle sera réclamée automatiquement dès que quelqu'un la pillera de ce montant.`
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
                        "- Prime posée.\n" +
                        `Poseur: ${message.author.username} (ID: ${message.author.id})\n` +
                        `Cible: ${target.username} (ID: ${target.id})\n` +
                        `Montant: ${amount.toLocaleString()} ¥\n` +
                        "Action: Yens prélevés. 🎯\n" +
                        "```"
                });

            }

        } catch (err) {

            console.error("Erreur logs bounty :", err);

        }
            }

};
