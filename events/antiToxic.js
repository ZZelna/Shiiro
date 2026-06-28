
const ShieldConfig = require("../models/ShieldConfig");

const warnings = new Map();

module.exports = async (message) => {
    console.log("Message reçu :", message.content);

    if (!message.guild) return;
    if (message.author.bot) return;

    const config = await ShieldConfig.findOne({
        guildId: message.guild.id
    });
    console.log("CONFIG =", config);

    if (!config?.enabled) return;

    if (config?.ignoredChannels?.includes(message.channel.id))
        return;

    if (
        message.member.roles.cache.some(role =>
            config?.ignoredRoles?.includes(role.id)
        )
    ) return;

    if (message.member.permissions.has("Administrator"))
        return;

    let content = message.content
        .toLowerCase()

        // Chiffres
        .replace(/0/g, "o")
        .replace(/1/g, "i")
        .replace(/3/g, "e")
        .replace(/4/g, "a")
        .replace(/5/g, "s")
        .replace(/7/g, "t")
        .replace(/8/g, "b")
        .replace(/9/g, "g")

        // Emojis Discord
        .replace(/<a?:\w+:\d+>/g, "")

        // Blocs de code
        .replace(/```[\s\S]*?```/g, "")

        // Backticks
        .replace(/`+/g, "")

        // Accents
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

    const separators =
        "[\\s._\\-*~'\",!?/\\\\|()\$begin:math:display$\\$end:math:display${}]*";

    function build(word) {

        const escaped = word
            .split("")
            .map(c =>
                c.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
            )
            .join(separators);

        return new RegExp(
            `(^|[^a-z])${escaped}([^a-z]|$)`,
            "i"
        );

    }

    const blacklist = [

        build("fdp"),
        build("ntm"),
        build("tg"),
        build("pute"),
        build("salope"),
        build("connard"),
        build("connasse"),
        build("batard"),
        build("encule"),
        build("enculer"),

        /\bfils\s+de\s+pute\b/i,
        /\bnique\s+ta\s+mere\b/i,
        /\bnique\s+ta\s+race\b/i

    ];

    const detected = blacklist.some(regex => regex.test(content));

  console.log("Texte nettoyé :", content);
console.log("Détecté :", detected);
    if (!detected)
        return;
 await message.delete().catch(() => {});

    const warnCount =
        (warnings.get(message.author.id) || 0) + 1;

    warnings.set(message.author.id, warnCount);

    try {

        switch (config.punishment) {

            case "timeout":
                await message.member.timeout(
                    config.timeoutDuration * 1000,
                    "Shield Protection"
                );
                break;

            case "kick":
                await message.member.kick(
                    "Shield Protection"
                );
                break;

            case "ban":
                await message.member.ban({
                    reason: "Shield Protection"
                });
                break;

        }

    } catch (err) {
        console.error(err);
    }

    const warn = await message.channel.send({
        content:
            `⚠️ ${message.author} langage interdit détecté.\nAvertissements : **${warnCount}**`
    });

    setTimeout(() => {
        warn.delete().catch(() => {});
    }, 5000);

};
