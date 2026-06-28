const ShieldConfig = require("../models/ShieldConfig");

module.exports = async (message) => {

    if (!message.guild) return;
    if (message.author.bot) return;

    const config = await ShieldConfig.findOne({
        guildId: message.guild.id
    });

    if (!config?.enabled) return;

    if (message.member.permissions.has("Administrator"))
        return;

    if (config.ignoredChannels.includes(message.channel.id))
        return;

    let content = message.content
        .toLowerCase()

        // Blocs de code Discord
        .replace(/```[\s\S]*?```/g, "")

        // Backticks
        .replace(/`+/g, "")

        // Caractères invisibles
        .replace(/[\u200B-\u200D\uFEFF]/g, "")

        // Supprime les séparateurs
        .replace(/[\s._\-~*]+/g, "");

    // Liens autorisés
    if (config.whitelistLinks?.length) {

        const allowed = config.whitelistLinks.some(link =>
            content.includes(
                link
                    .toLowerCase()
                    .replace(/[\s._\-~*]+/g, "")
            )
        );

        if (allowed) return;

    }

    const patterns = [

        /https?:\/\/\S+/i,

        /www\.\S+/i,

        /\b\S+\.(com|fr|net|gg|xyz|shop|io|org|me|tv|site|vip|co|ru|uk|eu|fun|live)\b/i,

        /\b\d{1,3}(\.\d{1,3}){3}\b/i,

        /discordgg/i,
        /discordcominvite/i,
        /discordappcominvite/i

    ];

    const detected = patterns.some(regex =>
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
            "Lien interdit"
        );
    } catch {}

    const warn = await message.channel.send({
        content: `🔗 ${message.author} Les liens sont interdits.`
    });

    setTimeout(() => {
        warn.delete().catch(() => {});
    }, 5000);

};
