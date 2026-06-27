const joins = new Map();

module.exports = async (member) => {

    if (member.user.bot) {

        try {

            await member.ban({
                reason: "Bot non autorisé"
            });

            const log = member.guild.channels.cache.get(
                "ID_LOGS"
            );

            if (log) {

                log.send(
                    `🤖 Bot banni automatiquement : ${member.user.tag}`
                );

            }

        } catch {}

        return;

    }

    const guildId = member.guild.id;

    if (!joins.has(guildId)) {

        joins.set(guildId, []);

    }

    const data = joins.get(guildId);

    const now = Date.now();

    data.push(now);

    // Garde uniquement les 10 dernières secondes
    joins.set(
        guildId,
        data.filter(time => now - time < 10000)
    );

    const recent = joins.get(guildId);

    // 10 arrivées en moins de 10 secondes
    if (recent.length >= 10) {

        const everyoneRole =
            member.guild.roles.everyone;

        try {

            await everyoneRole.setPermissions(
                everyoneRole.permissions.remove("SendMessages")
            );

        } catch {}

        const log = member.guild.channels.cache.get(
            "1520445114097598665"
        );

        if (log) {

            log.send({
                content:
                    `🚨 RAID DÉTECTÉ — Le serveur a été verrouillé automatiquement.`
            });

        }

    }

};
