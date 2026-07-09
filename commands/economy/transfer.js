const {
    EmbedBuilder
} = require("discord.js");

const Clan = require("../../models/Clan");

module.exports = {
    name: "transfer",

    async run(message) {

        const ALLOWED_CHANNEL = "1523677940750225508";

        if (message.channel.id !== ALLOWED_CHANNEL) {
            return message.reply(
                "❌ Cette commande est uniquement utilisable dans <#1523677940750225508>."
            );
        }

        const target = message.mentions.users.first();

        if (!target) {
            return message.reply(
                "❌ Utilisation : `*transfer @joueur`"
            );
        }

        const clan = await Clan.findOne({
            ownerId: message.author.id
        });

        if (!clan) {
            return message.reply(
                "❌ Tu n'es pas chef d'un clan."
            );
        }

        if (target.id === message.author.id) {
            return message.reply(
                "❌ Tu es déjà le chef du clan."
            );
        }

        if (!clan.members.includes(target.id)) {
            return message.reply(
                "❌ Ce joueur n'est pas dans ton clan."
            );
        }

        clan.ownerId = target.id;

        await clan.save();

        try {

            const channel = await message.guild.channels.fetch(
                clan.channelId
            );

            if (channel) {

                await channel.send({
                    embeds: [
                        new EmbedBuilder()
                            .setColor("Gold")
                            .setTitle("👑 Nouveau Chef")
                            .setDescription(
                                `${message.author} a transféré la propriété du clan à ${target}.`
                            )
                    ]
                });

            }

        } catch (err) {

            console.error(err);

        }

        const embed = new EmbedBuilder()
            .setColor("Green")
            .setTitle("✅ Propriété transférée")
            .setDescription(
                `${target} est désormais le chef du clan **${clan.name}**.`
            );

        return message.reply({
            embeds: [embed]
        });

    }
};
