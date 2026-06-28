const ShieldConfig = require("../models/ShieldConfig");

module.exports = async (message) => {

    if (!message.guild) return;
    if (message.author.bot) return;

    let config = await ShieldConfig.findOne({
        guildId: message.guild.id
    });

    if (!config) {
        config = await ShieldConfig.create({
            guildId: message.guild.id
        });
    }

    if (!config.enabled) return;

    if (message.member.permissions.has("Administrator"))
        return;
  
    if (message.member.roles.cache.has("1506702398029172796"))

    return;

    if (config.ignoredChannels.includes(message.channel.id))
        return;

    if (
        message.embeds.some(embed =>
            embed.type === "gifv" ||
            embed.provider?.name?.toLowerCase() === "tenor" ||
            embed.provider?.name?.toLowerCase() === "giphy"
        )
    ) {
        return;
    }


    if (message.attachments.size > 0)
        return;

    let content = message.content
        .toLowerCase()


        .replace(/```[\s\S]*?```/g, "")


        .replace(/`+/g, "")


        .replace(/<a?:\w+:\d+>/g, "")


        .replace(/[\u200B-\u200D\uFEFF]/g, "")


        .replace(/0/g, "o")
        .replace(/1/g, "i")
        .replace(/3/g, "e")
        .replace(/4/g, "a")
        .replace(/5/g, "s")
        .replace(/7/g, "t")
        .replace(/8/g, "b")
        .replace(/9/g, "g")
        .replace(/@/g, "a")

        
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

    const normalized = content.replace(
        /[\s._\-~*`\\/|()[\]{}:;"',!?+=<>]/g,
        ""
    );


    if (config.whitelistLinks?.length) {

        const allowed = config.whitelistLinks.some(link => {

            const clean = link
                .toLowerCase()
                .replace(/[\s._\-~*`\\/|()[\]{}:;"',!?+=<>]/g, "");

            return normalized.includes(clean);

        });

        if (allowed)
            return;
    }

    // Autoriser certains domaines (GIFs / CDN Discord)
    if (
        /tenor\.com/i.test(content) ||
        /media\.tenor\.com/i.test(content) ||
        /giphy\.com/i.test(content) ||
        /media\.giphy\.com/i.test(content) ||
        /cdn\.discordapp\.com/i.test(content) ||
        /media\.discordapp\.net/i.test(content)
    ) {
        return;
    }

    const detected =
        // HTTP / HTTPS
    /https?:\/\/\S+/i.test(content) ||
    /https?:\/\S+/i.test(content) ||
    /https?:\S+/i.test(content) ||

    // WWW
    /www\.\S+/i.test(content) ||

    // Domaines
    /\b\S+\.(com|fr|net|gg|xyz|shop|io|org|me|tv|site|vip|co|ru|uk|eu|fun|live)\b/i.test(content) ||

    // Invitations Discord
    /discord\.gg\/\S*/i.test(content) ||
    /discord\.com\/invite\/\S*/i.test(content) ||
    /discordapp\.com\/invite\/\S*/i.test(content) ||

    // Adresse IP
    /\b\d{1,3}(?:\.\d{1,3}){3}\b/.test(content) ||

    // Détection après normalisation
    normalized.includes("discordgg") ||
    normalized.includes("discordcominvite") ||
    normalized.includes("discordappcominvite") ||
    normalized.includes("http") ||
    normalized.includes("https") ||
    normalized.includes("www");

    if (!detected)
        return;

    try {
        await message.delete();
    } catch {}

    try {

        switch (config.punishment) {

            case "timeout":
                await message.member.timeout(
                    config.timeoutDuration * 1000,
                    "Lien interdit"
                );
                break;

            case "kick":
                await message.member.kick(
                    "Lien interdit"
                );
                break;

            case "ban":
                await message.member.ban({
                    reason: "Lien interdit"
                });
                break;

        }

    } catch {}

    const warn = await message.channel.send({
        content: `🔗 ${message.author} Les liens sont interdits.`
    }).catch(() => null);

    if (warn) {
        setTimeout(() => {
            warn.delete().catch(() => {});
        }, 5000);
    }

};
