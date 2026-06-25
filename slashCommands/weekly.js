const {
    SlashCommandBuilder,
    EmbedBuilder
} = require("discord.js");

const Clan =
require("../models/Clan");

module.exports = {

    data:
        new SlashCommandBuilder()
            .setName("weekly")
            .setDescription(
                "Termine la GDC et supprime tous les clans"
            ),

    async execute(interaction) {
    const roleAllowed =
    "1506674274826584284";

if (
    !interaction.member.roles.cache.has(
        roleAllowed
    )
) {

    return interaction.reply({
        content:
            "❌ Tu n'as pas la permission d'utiliser cette commande.",
        ephemeral: true
    });

}

        const clans =
            await Clan.find()
               .sort({
    weeklyYens: -1
})

        if (!clans.length) {

            return interaction.reply({
                content:
                    "❌ Aucun clan trouvé."
            });

        }

        const classement =
            clans
                .slice(0, 10)
                .map(
                    (clan, index) =>
                        `${index + 1}. ${clan.name} — ${clan.totalYens.toLocaleString()} ¥`
                )
                .join("\n");

        const winner =
            clans[0];

        const embed =
    new EmbedBuilder()
        .setColor("Gold")
        .setTitle("🏆 Fin de la GDC")
        .setDescription(
            `👑 Clan gagnant : **${winner.name}**\n\n${classement}`
        );

for (const clan of clans) {

    if (!clan.channelId)
        continue;

    const channel =
        interaction.guild.channels.cache.get(
            clan.channelId
        );

    if (channel) {

        await channel.delete(
            "Fin de la GDC"
        ).catch(() => {});

    }

}

await Clan.deleteMany({});

await interaction.reply({
    embeds: [embed]
});
    }
};
