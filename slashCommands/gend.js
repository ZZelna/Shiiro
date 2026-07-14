const {
    SlashCommandBuilder,
    ContainerBuilder,
    TextDisplayBuilder,
    MessageFlags
} = require("discord.js");

const Giveaway = require("../models/Giveaway");

const allowedRoles = [
    "1506674274826584284",
    "1507082580414173234",
    "1521595694052409485"
];

module.exports = {
    data: new SlashCommandBuilder()
        .setName("gend")
        .setDescription("Terminer un giveaway")
        .addStringOption(option =>
            option
                .setName("messageid")
                .setDescription("ID du message giveaway")
                .setRequired(true)
        ),

    async execute(interaction) {

        const hasPermission =
            interaction.member.roles.cache.some(role =>
                allowedRoles.includes(role.id)
            );

        if (!hasPermission) {
            return interaction.reply({
                content: "❌ Vous n'avez pas la permission.",
                ephemeral: true
            });
        }

        const messageId =
            interaction.options.getString("messageid");

        const giveaway =
            await Giveaway.findOne({
                messageId
            });

        if (!giveaway) {
            return interaction.reply({
                content: "❌ Giveaway introuvable.",
                ephemeral: true
            });
        }

        if (giveaway.ended) {
            return interaction.reply({
                content: "❌ Ce giveaway est déjà terminé.",
                ephemeral: true
            });
        }

        giveaway.ended = true;

        let winners = [];

        if (
            giveaway.participants &&
            giveaway.participants.length > 0
        ) {

            const shuffled =
                [...giveaway.participants]
                    .sort(() => Math.random() - 0.5);

            winners =
                shuffled.slice(
                    0,
                    giveaway.winnersCount
                );

            giveaway.winners = winners;

        }

        await giveaway.save();

        try {

            const channel =
                await interaction.client.channels.fetch(
                    giveaway.channelId
                );

            const msg =
                await channel.messages.fetch(
                    giveaway.messageId
                );

            const emoji = giveaway.type === "casino"
                ? "<:casino:1507449727266979922>"
                : "<:nitro:1508097922489647234>";

            const endedContainer = new ContainerBuilder()
                .setAccentColor(0xED4245)
                .addTextDisplayComponents(
                    new TextDisplayBuilder().setContent("# 🎉 GIVEAWAY TERMINÉ")
                )
                .addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(
                        `**Lot :** ${giveaway.prize}\n` +
                        `${emoji} **${giveaway.participants.length}** participant(s)\n\n` +
                        (winners.length > 0
                            ? `🏆 **Gagnants**\n${winners.map(id => `<@${id}>`).join("\n")}`
                            : "🏆 **Gagnants**\nAucun participant")
                    )
                );

            await msg.edit({
                components: [endedContainer],
                flags: MessageFlags.IsComponentsV2
            });

        } catch (err) {
            console.log(err);
        }

        const resultContainer = new ContainerBuilder()
            .setAccentColor(0x2ECC71)
            .addTextDisplayComponents(
                new TextDisplayBuilder().setContent("## ✅ Giveaway terminé")
            )
            .addTextDisplayComponents(
                new TextDisplayBuilder().setContent(
                    `🎁 **Lot**\n${giveaway.prize}\n\n` +
                    `🏆 **Gagnants**\n` +
                    (winners.length > 0
                        ? winners.map(id => `<@${id}>`).join("\n")
                        : "Aucun participant")
                )
            );

        await interaction.reply({
            components: [resultContainer],
            flags: MessageFlags.IsComponentsV2
        });

        if (winners.length > 0) {

            await interaction.channel.send({
                content:
                    `🎉 Félicitations ` +
                    winners
                        .map(id => `<@${id}>`)
                        .join(", ") +
                    ` ! Vous remportez **${giveaway.prize}**`
            });

        }

    }
};
