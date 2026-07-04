module.exports = async (client) => {

    const GUILD_ID = "1506672014679740546";

    const TOTAL_CHANNEL = "1508892135049658579";
    const MEMBERS_CHANNEL = "1508891645049966723";
    const BOTS_CHANNEL = "1508892881841164450";
    const BOOSTS_CHANNEL = "1522926593021050950";

    async function updateStats() {

        const guild = client.guilds.cache.get(GUILD_ID);
        if (!guild) return;

        const total = guild.memberCount;
        const bots = guild.members.cache.filter(m => m.user.bot).size;
        const members = total - bots;
        const boosts = guild.premiumSubscriptionCount || 0;

        const totalChannel = guild.channels.cache.get(TOTAL_CHANNEL);
        const membersChannel = guild.channels.cache.get(MEMBERS_CHANNEL);
        const botsChannel = guild.channels.cache.get(BOTS_CHANNEL);
        const boostsChannel = guild.channels.cache.get(BOOSTS_CHANNEL);

        if (totalChannel && totalChannel.name !== `💕・Total : ${total}`) {
            await totalChannel.setName(`💕・Total : ${total}`).catch(console.error);
        }

        if (membersChannel && membersChannel.name !== `🌊・Membres : ${members}`) {
            await membersChannel.setName(`🌊・Membres : ${members}`).catch(console.error);
        }

        if (botsChannel && botsChannel.name !== `🍃・Bots : ${bots}`) {
            await botsChannel.setName(`🍃・Bots : ${bots}`).catch(console.error);
        }

        if (boostsChannel && boostsChannel.name !== `🔮・Boosts : ${boosts}`) {
            await boostsChannel.setName(`🔮・Boosts : ${boosts}`).catch(console.error);
        }

    }

    await updateStats();

    client.on("guildMemberAdd", updateStats);
    client.on("guildMemberRemove", updateStats);

    setInterval(updateStats, 60000);

};
