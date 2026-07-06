const { EmbedBuilder } = require("discord.js");

module.exports = async (member) => {

    const channel = member.guild.channels.cache.get(
        "1508491934547574814"
    );

    if (!channel) return;

    const embed = new EmbedBuilder()
        .setColor(0x5865F2)
        .setTitle("🎉 Bienvenue sur Shiiro")
        .setDescription(
            `Bienvenue ${member} !\n\nGrâce à toi, nous sommes désormais **${member.guild.memberCount} membres**.`
        )
        .setThumbnail(member.user.displayAvatarURL())
        .setImage("https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExZXZoaDJwMm54OHY0ZjN6Mmt3a25vZ2E1emYxNXhsOG80Y2FoZ2ZlbiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/jtDEDcqMjDVODssiEs/giphy.gif")
        .setTimestamp();

    await channel.send({
        embeds: [embed]
    });
};
