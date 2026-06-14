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
        .setImage("https://static.klipy.com/ii/e1b92bb53e0c9e442408bc677a56c789/cf/4e/squUjOdmywiQ7oM8Q.gif")
        .setTimestamp();

    await channel.send({
        embeds: [embed]
    });
};
