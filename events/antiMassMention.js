const ShieldConfig = require("../models/ShieldConfig");

module.exports = async (message) => {

    if (!message.guild) return;
    if (message.author.bot) return;

    const config = await ShieldConfig.findOne({
        guildId: message.guild.id
    });

    if (!config?.enabled) return;

    if (
        message.member.permissions.has("Administrator")
    ) return;

    if (
        config.ignoredChannels.includes(
            message.channel.id
        )
    ) return;

    // Bloque @everyone et @here
    if (
        message.mentions.everyone
    ) {

        try {
            await message.delete();
        } catch {}

        try {
            await message.member.timeout(
                config.timeoutDuration * 1000,
                "Mass Mention"
            );
        } catch {}

        const warn =
            await message.channel.send({
                content:
                `🚫 ${message.author} Les mentions @everyone et @here sont interdites.`
            });

        setTimeout(() => {
            warn.delete().catch(() => {});
        }, 5000);

        return;
    }

    // Bloque plus de 10 mentions
    if (
        message.mentions.users.size >= 10
    ) {

        try {
            await message.delete();
        } catch {}

        try {
            await message.member.timeout(
                config.timeoutDuration * 1000,
                "Mass Mention"
            );
        } catch {}

        const warn =
            await message.channel.send({
                content:
                `🚫 ${message.author} Trop de personnes mentionnées.`
            });

        setTimeout(() => {
            warn.delete().catch(() => {});
        }, 5000);

    }

};
