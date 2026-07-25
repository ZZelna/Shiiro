const {
    EmbedBuilder
} = require("discord.js");

const Marriage = require("../../models/Marriage");
const Family = require("../../models/Family");
const Child = require("../../models/Child");

module.exports = {

    name: "couple",

    async run(message) {

        const marriage = await Marriage.findOne({
            guildId: message.guild.id,
            users: message.author.id
        });

        if (!marriage)
            return message.reply("❌ Vous n'êtes pas marié.");

        const partnerId = marriage.users.find(
            id => id !== message.author.id
        );

        const partner = await message.client.users
            .fetch(partnerId)
            .catch(() => null);

        const family = await Family.findOne({
            marriageId: marriage._id
        });

        const children = family
            ? await Child.countDocuments({
                  familyId: family._id
              })
            : 0;

        const marriedDays = marriage.marriedAt
            ? Math.floor(
                  (Date.now() - marriage.marriedAt.getTime()) /
                  86400000
              )
            : 0;

        const voiceSeconds = marriage.voiceSeconds || 0;

        const voiceHours = Math.floor(
            voiceSeconds / 3600
        );

        const voiceMinutes = Math.floor(
            (voiceSeconds % 3600) / 60
        );

        const embed = new EmbedBuilder()

            .setColor("#5DADE2")

            .setAuthor({
                name: `${message.author.username} ❤️ ${partner?.username || "Inconnu"}`
            });

        if (partner) {
            embed.setThumbnail(
                partner.displayAvatarURL({
                    size: 512
                })
            );
        }

        embed

            .addFields(

                {
                    name: "💍 Conjoint",
                    value: `<@${partnerId}>`,
                    inline: true
                },

                {
                    name: "📅 Mariés depuis",
                    value: `${marriedDays} jour(s)`,
                    inline: true
                },

                {
                    name: "❤️ Amour",
                    value: `${marriage.love || 0}`,
                    inline: true
                },

                {
                    name: "💋 Bisous",
                    value: `${marriage.kisses || 0}`,
                    inline: true
                },

                {
                    name: "🤗 Câlins",
                    value: `${marriage.hugs || 0}`,
                    inline: true
                },

                {
                    name: "🎁 Cadeaux",
                    value: `${marriage.gifts || 0}`,
                    inline: true
                },

                {
                    name: "🎤 Temps vocal",
                    value: `${voiceHours}h ${voiceMinutes}m`,
                    inline: true
                },

                {
                    name: "💬 Messages",
                    value: `${marriage.messagesTogether || 0}`,
                    inline: true
                },

                {
                    name: "👶 Enfants",
                    value: `${children}`,
                    inline: true
                },

                {
                    name: "🏡 Famille",
                    value: family?.name || "Aucune",
                    inline: true
                }

            )

            .setFooter({
                text: "Shiiro • Couple"
            })

            .setTimestamp();

        return message.reply({
            embeds: [embed]
        });

    }

};
