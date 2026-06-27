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

    const content =
        message.content.toLowerCase();

    const invites = [

        /discord\.gg\/[a-z0-9]+/i,
        /discord\.com\/invite\/[a-z0-9]+/i,
        /discordapp\.com\/invite\/[a-z0-9]+/i

    ];

    const detected =
        invites.some(regex =>
            regex.test(content)
        );

    if (!detected)
        return;

    try {

        await message.delete();

    } catch {}

    try {

        await message.member.timeout(
            config.timeoutDuration * 1000,
            "Invitation Discord"
        );

    } catch {}

    const warn =
        await message.channel.send({

            content:
                `🚫 ${message.author} Les invitations Discord sont interdites.`

        });

    setTimeout(() => {

        warn.delete().catch(() => {});

    }, 5000);

};
