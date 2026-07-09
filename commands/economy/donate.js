const {
    EmbedBuilder
} = require("discord.js");

const CasinoProfile = require("../../models/CasinoProfile");

const LOGS_CASINO = "1520766436388245585";

module.exports = {
    name: "donate",

    async run(message, args) {

        const ALLOWED_CHANNEL = "1523677940750225508";

        if (message.channel.id !== ALLOWED_CHANNEL) {
            return message.reply(
                "❌ Cette commande est uniquement utilisable dans <#1523677940750225508>."
            );
        }

        const target = message.mentions.users.first();

        const amount = parseInt(args[1]);

        if (!target) {
            return message.reply(
                "❌ Utilisation : `*donate @joueur montant`"
            );
        }

        if (!amount || amount <= 0) {
            return message.reply(
                "❌ Tu dois entrer un montant valide."
            );
        }

        if (target.id === message.author.id) {
            return message.reply(
                "❌ Tu ne peux pas te donner des Yens à toi-même."
            );
        }

        const sender = await CasinoProfile.findOne({
            userId: message.author.id
        });

        if (!sender) {
            return message.reply(
                "❌ Tu n'as pas de profil casino."
            );
        }

        const receiver = await CasinoProfile.findOne({
            userId: target.id
        });

        if (!receiver) {
            return message.reply(
                "❌ Ce joueur n'a pas de profil casino."
            );
        }

        if (sender.yens < amount) {
            return message.reply(
                "❌ Tu ne possèdes pas assez de Yens."
            );
        }

        sender.yens -= amount;
        receiver.yens += amount;

        await sender.save();
        await receiver.save();

        const embed = new EmbedBuilder()
            .setColor("Green")
            .setTitle("💴 Donation effectuée")
            .setDescription(
                `${message.author} a envoyé **${amount.toLocaleString()} ¥** à ${target}.`
            )
            .setTimestamp();

        await message.reply({
            embeds: [embed]
        });

        try {

            const logsGuild = message.client.guilds.cache.find(g =>
                g.channels.cache.has(LOGS_CASINO)
            );

            const logsChannel = logsGuild?.channels.cache.get(LOGS_CASINO);

            if (logsChannel) {

                await logsChannel.send({
                    content:
                        "```diff\n" +
                        "- Donation effectuée.\n" +
                        `Expéditeur: ${message.author.username} (ID: ${message.author.id})\n` +
                        `Destinataire: ${target.username} (ID: ${target.id})\n` +
                        `Montant: ${amount.toLocaleString()} ¥\n` +
                        "Action: Yens transférés. 💴\n" +
                        "```"
                });

            }

        } catch (err) {
            console.error(err);
        }

    }
};
