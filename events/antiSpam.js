const ShieldConfig = require("../models/ShieldConfig");

const cache = new Map();

module.exports = async (message) => {

    if (!message.guild) return;
    if (message.author.bot) return;

    const config = await ShieldConfig.findOne({
        guildId: message.guild.id
    });

    if (!config?.enabled) return;

    if (config.ignoredChannels.includes(message.channel.id))
        return;

    if (
        message.member.permissions.has("Administrator")
    ) return;

    const userId = message.author.id;

    if (!cache.has(userId)) {

        cache.set(userId, {
            messages: [],
            lastContent: ""
        });

    }

    const data = cache.get(userId);

    const now = Date.now();

    data.messages.push(now);

    data.messages =
        data.messages.filter(
            time => now - time < 5000
        );

    // 6 messages en moins de 5 secondes
    if (data.messages.length >= 6) {

        try {

            await message.member.timeout(
                config.timeoutDuration * 1000,
                "Spam"
            );

        } catch {}

        await message.delete().catch(() => {});

        const warn =
            await message.channel.send({
                content:
                    `🚫 ${message.author} Spam détecté.`
            });

        setTimeout(() => {
            warn.delete().catch(() => {});
        }, 5000);

        cache.delete(userId);

        return;
    }

    // Copier / coller
    if (
        data.lastContent === message.content &&
        message.content.length >= 15
    ) {

        try {

            await message.member.timeout(
                config.timeoutDuration * 1000,
                "Spam répétitif"
            );

        } catch {}

        await message.delete().catch(() => {});

        const warn =
            await message.channel.send({
                content:
                    `🚫 ${message.author} Arrête de répéter le même message.`
            });

        setTimeout(() => {
            warn.delete().catch(() => {});
        }, 5000);

        cache.delete(userId);

        return;
    }

    data.lastContent = message.content;

};
