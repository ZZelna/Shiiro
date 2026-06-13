const config = require("../../config.json");
const { EmbedBuilder } = require("discord.js");

module.exports = {
    name: "shiiro",

    async run(message) {

        if (!config.owner_ids.includes(message.author.id)) {
            return message.reply("❌ Cette commande est réservée aux owners.");
        }
    
    const guild = message.guild;

const totalMembers = guild.memberCount;

const online = guild.members.cache.filter(
    m => m.presence?.status === "online"
).size;

const idle = guild.members.cache.filter(
    m => m.presence?.status === "idle"
).size;

const dnd = guild.members.cache.filter(
    m => m.presence?.status === "dnd"
).size;

const vocalMembers = guild.members.cache.filter(
    m => m.voice.channel
).size;

const streamingMembers = guild.members.cache.filter(
    m => m.voice.streaming
).size;

        const embed = new EmbedBuilder()
    .setColor("#2B2D31")
.setTitle(`${guild.name} 🏆 #🇫🇷 Statistiques !`)
            .setDescription(`👥 **Membres :** ${totalMembers.toLocaleString()} 🟢 **En ligne :** ${(online + idle + dnd).toLocaleString()} 🎤 **En Vocal :** ${vocalMembers.toLocaleString()} 📺 **En stream :** ${streamingMembers.toLocaleString()} 🚀 **Boost :** ${guild.premiumSubscriptionCount.toLocaleString()}`)
    .setThumbnail(guild.iconURL({ dynamic: true }))
    .setTimestamp()

        return message.channel.send({
            embeds: [embed]
        });
    }
};
