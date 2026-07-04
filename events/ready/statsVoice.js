const { ChannelType, PermissionFlagsBits } = require("discord.js");

module.exports = async (client) => {

    async function updateStats() {

        const guild = client.guilds.cache.first();
        if (!guild) return;

        const total = guild.memberCount;

        const members = guild.members.cache.filter(
            m => !m.user.bot
        ).size;

        const bots = guild.members.cache.filter(
            m => m.user.bot
        ).size;

        const boosts = guild.premiumSubscriptionCount;

        const online = guild.members.cache.filter(
            m => m.presence?.status && m.presence.status !== "offline"
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
            ["👥 Total", total],
            ["💕 Membres", members],
            ["🍃 Bots", bots],
            ["🔮 Boosts", boosts],
            ["🌊 En ligne", online]
        ];

        for (const [label, value] of stats) {

            const name = `${label} : ${value}`;

            let channel = guild.channels.cache.find(
                c =>
                    c.parentId === category.id &&
                    c.type === ChannelType.GuildVoice &&
                    c.name.startsWith(label)
            );

            if (!channel) {

                await guild.channels.create({
                    name,
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

            } else if (channel.name !== name) {

                await channel.setName(name).catch(() => {});

            }

        }

    }

    client.once("ready", updateStats);
    client.on("guildMemberAdd", updateStats);
    client.on("guildMemberRemove", updateStats);
    client.on("presenceUpdate", updateStats);

    setInterval(updateStats, 60000);

};
