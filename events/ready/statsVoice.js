const { ChannelType, PermissionFlagsBits } = require("discord.js");

module.exports = async (client) => {

    async function updateStats() {

        const guild = client.guilds.cache.first();
        if (!guild) return;

        await guild.members.fetch();

        const total = guild.memberCount;
        const members = guild.members.cache.filter(m => !m.user.bot).size;
        const bots = guild.members.cache.filter(m => m.user.bot).size;
        const boosts = guild.premiumSubscriptionCount;
        const online = guild.members.cache.filter(
            m => m.presence && m.presence.status !== "offline"
        ).size;

        let category = guild.channels.cache.find(
            c =>
                c.type === ChannelType.GuildCategory &&
                c.name === "📊 Statistiques"
        );

        if (!category) {
            category = await guild.channels.create({
                name: "📊 Statistiques",
                type: ChannelType.GuildCategory
            });
        }

        const stats = [
            { name: "👥 Total", value: total },
            { name: "💕 Membres", value: members },
            { name: "🤖 Bots", value: bots },
            { name: "🔮 Boosts", value: boosts },
            { name: "🌊 En ligne", value: online }
        ];

        for (const stat of stats) {

            const channelName = `${stat.name} : ${stat.value}`;

            let channel = guild.channels.cache.find(
                c =>
                    c.parentId === category.id &&
                    c.type === ChannelType.GuildVoice &&
                    c.name.startsWith(stat.name)
            );

            if (!channel) {

                await guild.channels.create({
                    name: channelName,
                    type: ChannelType.GuildVoice,
                    parent: category.id,
                    permissionOverwrites: [
                        {
                            id: guild.roles.everyone.id,
                            deny: [
                                PermissionFlagsBits.Connect,
                                PermissionFlagsBits.Speak
                            ]
                        }
                    ]
                });

            } else if (channel.name !== channelName) {

                await channel.setName(channelName).catch(() => {});

            }

        }

    }

    await updateStats();

    client.on("guildMemberAdd", member => updateStats(member.guild));
    client.on("guildMemberRemove", member => updateStats(member.guild));
    client.on("presenceUpdate", (_, newPresence) => updateStats(newPresence.guild));

    setInterval(updateStats, 60000);

};
