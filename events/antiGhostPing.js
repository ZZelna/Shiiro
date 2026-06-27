const ghostMentions = new Map();

module.exports = {

    messageCreate(message) {

        if (message.author.bot) return;

        if (message.mentions.users.size === 0)
            return;

        ghostMentions.set(message.id, {

            author: message.author.id,

            mentions: [...message.mentions.users.keys()],

            channel: message.channel.id,

            guild: message.guild.id

        });

    },

    async messageDelete(message) {

        if (!ghostMentions.has(message.id))
            return;

        const data =
            ghostMentions.get(message.id);

        ghostMentions.delete(message.id);

        try {

            const guild =
                message.client.guilds.cache.get(
                    data.guild
                );

            const member =
                await guild.members.fetch(
                    data.author
                );

            await member.timeout(
                20 * 1000,
                "Ghost Ping"
            ).catch(() => {});

            const channel =
                guild.channels.cache.get(
                    data.channel
                );

            const users =
                data.mentions
                    .map(id => `<@${id}>`)
                    .join(", ");

            const warn =
                await channel.send({

                    content:
                        `👻 ${member} Ghost Ping détecté.\nMentions : ${users}`

                });

            setTimeout(() => {

                warn.delete().catch(() => {});

            }, 5000);

        } catch {}

    }

};
