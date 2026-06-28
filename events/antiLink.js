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

    if (config.ignoredChannels.includes(message.channel.id))
        return;

    let content = message.content
        .toLowerCase()

        // Blocs de code
        .replace(/```[\s\S]*?```/g, "")

        // Backticks
        .replace(/`+/g, "")

        // Emojis Discord
        .replace(/<a?:\w+:\d+>/g, "")

        // Caractères invisibles
        .replace(/[\u200B-\u200D\uFEFF]/g, "")

        // Leetspeak
        .replace(/0/g, "o")
        .replace(/1/g, "i")
        .replace(/3/g, "e")
        .replace(/4/g, "a")
        .replace(/5/g, "s")
        .replace(/7/g, "t")
        .replace(/8/g, "b")
        .replace(/9/g, "g")
        .replace(/@/g, "a")

        // Accents
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

    const normalized = content.replace(
        /[\s._\-~*`\\/|()[\]{}:;"',!?+=<>]/g,
        ""
    );

    // Liens autorisés
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

    const detected =

        /https?:\/\/\S+/i.test(content) ||
        /https?:\/\S+/i.test(content) ||
        /https?:\S+/i.test(content) ||

        /www\.\S+/i.test(content) ||

        /\b\S+\.(com|fr|net|gg|xyz|shop|io|org|me|tv|site|vip|co|ru|uk|eu|fun|live)\b/i.test(content) ||

        /\b\d{1,3}(\.\d{1,3}){3}\b/.test(content) ||

        normalized.includes("discordgg") ||
        normalized.includes("discordg") ||
        normalized.includes("discordcominvite") ||
        normalized.includes("discordappcominvite") ||
        normalized.includes("discordinvite") ||
        normalized.includes("discordcom") ||
        normalized.includes("discordapp") ||
        normalized.includes("www") ||
        normalized.includes("http") ||
        normalized.includes("https");

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

};
