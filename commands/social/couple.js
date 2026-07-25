const {
    EmbedBuilder
} = require("discord.js");

const Marriage = require("../../models/Marriage");
const Family = require("../../models/Family");

module.exports = {
    name: "couple",

    async run(message) {

        const marriage = await Marriage.findOne({
            guildId: message.guild.id,
            users: message.author.id
        });

        if (!marriage)
            return message.reply("❌ Vous n'êtes pas marié.");

        const partnerId = marriage.users.find(id => id !== message.author.id);

        const partner =
            await message.client.users.fetch(partnerId).catch(() => null);

        const family = await Family.findOne({
            marriageId: marriage._id
        });

        const marriedDays = Math.floor(
            (Date.now() - marriage.marriedAt.getTime()) /
            (1000 * 60 * 60 * 24)
        );

        const voiceHours = Math.floor((marriage.voiceSeconds || 0) / 3600);
        const voiceMinutes = Math.floor(((marriage.voiceSeconds || 0) % 3600) / 60);

        const embed = new EmbedBuilder()
            .setColor("#5DADE2")
            .setAuthor({
                name: `${message.author.username} ❤️ ${partner?.username || "Inconnu"}`
            })
            .setThumbnail(partner?.displayAvatarURL({
                size: 512
            }))
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
                    name: "❤️ Love",
                    value: `${marriage.love}`,
                    inline: true
                },
                {
                    name: "💋 Bisous",
                    value: `${marriage.kisses}`,
                    inline: true
                },
                {
                    name: "🤗 Câlins",
                    value: `${marriage.hugs}`,
                    inline: true
                },
                {
                    name: "🎁 Cadeaux",
                    value: `${marriage.gifts}`,
                    inline: true
                },
                {
                    name: "🎤 Temps vocal",
                    value: `${voiceHours}h ${voiceMinutes}m`,
                    inline: true
                },
                {
                    name: "💬 Messages",
                    value: `${marriage.messagesTogether}`,
                    inline: true
                },
                {
                    name: "👨‍👩‍👧 Famille",
                    value: family ? family.name : "Aucune",
                    inline: false
                }
            )
            .setFooter({
                text: "Shiiro • Couple"
            })
            .setTimestamp();

        message.reply({
            embeds: [embed]
        });

    }
};
