const ShieldConfig = require("../models/ShieldConfig");

const joins = new Map();

module.exports = async (member) => {

    if (member.user.bot) {

        try {

            await member.ban({
                reason: "Bot non autorisé"
            });

        } catch {}

        return;
    }

    const config = await ShieldConfig.findOne({
        guildId: member.guild.id
    });

    if (!config?.enabled) return;

    const now = Date.now();

    if (!joins.has(member.guild.id)) {
        joins.set(member.guild.id, []);
    }

    const guildJoins = joins.get(member.guild.id);

    guildJoins.push(now);

    // On garde uniquement les 10 dernières secondes
    joins.set(
        member.guild.id,
        guildJoins.filter(
            time => now - time < 10000
        )
    );

    // Compte créé il y a moins de 3 jours
    const accountAge =
        now - member.user.createdTimestamp;

    if (
        accountAge <
        3 * 24 * 60 * 60 * 1000
    ) {

        try {

            await member.ban({
                reason: "Compte trop récent"
            });

        } catch {}

        return;
    }

    // RAID : 8 joins en moins de 10 sec
    if (
        joins.get(member.guild.id).length >= 8
    ) {

        const everyone =
            member.guild.roles.everyone;

        const textChannels =
            member.guild.channels.cache.filter(
                c =>
                    c.isTextBased() &&
                    c.permissionsFor(everyone)
            );

        for (const channel of textChannels.values()) {

            try {

                await channel.permissionOverwrites.edit(
                    everyone,
                    {
                        SendMessages: false
                    }
                );

            } catch {}

        }

        if (config.logsChannel) {

            const log =
                member.guild.channels.cache.get(
                    config.logsChannel
                );

            if (log) {

                log.send({
                    content:
                        "🚨 **RAID DÉTECTÉ** — Tous les salons ont été verrouillés."
                }).catch(() => {});

            }

        }

    }

};
