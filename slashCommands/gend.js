const {
    SlashCommandBuilder,
    EmbedBuilder
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

            const embed =
                EmbedBuilder.from(
                    msg.embeds[0]
                );

            embed
                .setColor("Red")
                .setTitle("🎉 GIVEAWAY TERMINÉ");

            if (winners.length > 0) {

                embed.addFields({
                    name: "🏆 Gagnants",
                    value:
                        winners
                            .map(id => `<@${id}>`)
                            .join("\n")
                });

            } else {

                embed.addFields({
                    name: "🏆 Gagnants",
                    value: "Aucun participant"
                });

            }

            await msg.edit({
                embeds: [embed],
                components: []
            });

        } catch (err) {
            console.log(err);
        }

        const resultEmbed =
            new EmbedBuilder()
                .setColor("Green")
                .setTitle("✅ Giveaway terminé")
                .addFields(
                    {
                        name: "🎁 Lot",
                        value: giveaway.prize
                    },
                    {
                        name: "🏆 Gagnants",
                        value:
                            winners.length > 0
                                ? winners
                                      .map(id => `<@${id}>`)
                                      .join("\n")
                                : "Aucun participant"
                    }
                )
                .setTimestamp();

        await interaction.reply({
            embeds: [resultEmbed]
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
