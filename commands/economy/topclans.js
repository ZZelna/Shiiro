const {
    EmbedBuilder
} = require("discord.js");

const Clan = require("../../models/Clan");
const { checkCasinoChannel } = require("../../utils/guards/casinoChannelGuard");

module.exports = {
    name: "topclans",

    async run(message) {

        if (!(await checkCasinoChannel(message))) return;

        const clans = await Clan.find();

        if (!clans.length) {
            return message.reply(
                "❌ Aucun clan trouvé."
            );
        }

        const medals = [
            "🥇",
            "🥈",
            "🥉",
            "🏅",
            "🏅"
        ];

        let description = "";

        const clansWithYens = clans
            .map(clan => ({
                clan,
                weeklyYens: clan.weeklyYens || 0
            }))
            .sort((a, b) => b.weeklyYens - a.weeklyYens)
            .slice(0, 5);

        clansWithYens.forEach((data, index) => {

            description +=
`${medals[index]} **${data.clan.name}**
⚔️ ${data.weeklyYens.toLocaleString()} ¥
👥 ${data.clan.members.length}/5 membres

`;

        });

        const embed = new EmbedBuilder()
            .setColor("Gold")
            .setTitle("⚔️ Top 5 Clans")
            .setDescription(description)
            .setTimestamp();

        return message.reply({
            embeds: [embed]
        });

    }
};
