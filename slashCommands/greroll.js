const {
    SlashCommandBuilder,
    ContainerBuilder,
    TextDisplayBuilder,
    MessageFlags
} = require("discord.js");

const Giveaway = require("../models/Giveaway");

const allowedRoles = [
    "1506674274826584284",
    "1506709088451690708",
    "1521595694052409485"
];

module.exports = {
    data: new SlashCommandBuilder()
        .setName("greroll")
        .setDescription("Retirer au sort un giveaway terminé")
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

        if (
            !giveaway.participants ||
            giveaway.participants.length === 0
        ) {
            return interaction.reply({
                content: "❌ Aucun participant.",
                ephemeral: true
            });
        }

        const shuffled =
            [...giveaway.participants]
                .sort(() => Math.random() - 0.5);

        const winners =
            shuffled.slice(
                0,
                giveaway.winnersCount
            );

        giveaway.winners = winners;

        await giveaway.save();

        const container = new ContainerBuilder()
            .setAccentColor(0x2ECC71)
            .addTextDisplayComponents(
                new TextDisplayBuilder().setContent("## 🎉 Giveaway reroll")
            )
            .addTextDisplayComponents(
                new TextDisplayBuilder().setContent(
                    `🎁 **Lot**\n${giveaway.prize}\n\n` +
                    `🏆 **Nouveaux gagnants**\n${winners.map(id => `<@${id}>`).join("\n")}`
                )
            );

        await interaction.reply({
            components: [container],
            flags: MessageFlags.IsComponentsV2
        });

        await interaction.channel.send({
            content:
                `🎉 Nouveaux gagnants du giveaway : ` +
                winners
                    .map(id => `<@${id}>`)
                    .join(", ")
        });
    }
};
