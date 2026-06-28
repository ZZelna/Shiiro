const joins = new Map();
const AllowedBot = require("../models/AllowedBot");

module.exports = async (member) => {

    // Anti Bot
    if (member.user.bot) {

        const allowed = await AllowedBot.findOne({
            botId: member.id
        });

        if (allowed) return;

        try {

            await member.ban({
                reason: "Bot non autorisé"
            });

            const log = member.guild.channels.cache.get(
                "1520445114097598665"
            );

            if (log) {
                await log.send(
                    `🤖 Bot banni automatiquement : ${member.user.tag} (${member.id})`
                );
            }

        } catch (err) {
            console.error(err);
        }

        return;
    }

    const guildId = member.guild.id;

    if (!joins.has(guildId))
        joins.set(guildId, []);

    const now = Date.now();

    const data = joins.get(guildId);

    data.push(now);

    joins.set(
        guildId,
        data.filter(t => now - t < 10000)
    );

    if (joins.get(guildId).length >= 10) {

        try {

            const everyone = member.guild.roles.everyone;

            await everyone.setPermissions(
                everyone.permissions.remove("SendMessages")
            );

        } catch {}

        const log = member.guild.channels.cache.get(
            "1520445114097598665"
        );

        if (log) {

            await log.send({
                content:
                    "🚨 **RAID DÉTECTÉ** — Le serveur a été verrouillé automatiquement."
            });

        }

        joins.set(guildId, []);
    }

};
