const {
    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");

const Giveaway = require("../models/Giveaway");

const CASINO_EMOJI = "1507449727266979922";
const NITRO_EMOJI = "1508097922489647234";

const allowedRoles = [
    "1506674274826584284",
    "1507082580414173234"
];

module.exports = {
    data: new SlashCommandBuilder()
        .setName("gw")
        .setDescription("Créer un giveaway")
        .addStringOption(option =>
            option
                .setName("type")
                .setDescription("Type du giveaway")
                .setRequired(true)
                .addChoices(
                    { name: "Casino", value: "casino" },
                    { name: "Nitro", value: "nitro" }
                )
        )
        .addStringOption(option =>
            option
                .setName("lot")
                .setDescription("Lot du giveaway")
                .setRequired(true)
        )
        .addIntegerOption(option =>
            option
                .setName("gagnants")
                .setDescription("Nombre de gagnants")
                .setRequired(true)
        )
        .addIntegerOption(option =>
            option
                .setName("duree")
                .setDescription("Durée en minutes")
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

        const type =
            interaction.options.getString("type");

        const prize =
            interaction.options.getString("lot");

        const winnersCount =
            interaction.options.getInteger("gagnants");

        const duration =
            interaction.options.getInteger("duree");

        const endAt =
            Date.now() +
            duration * 60 * 1000;

        const emoji =
type === "casino"
? `<:casino:${CASINO_EMOJI}>`
: `<:nitro:${NITRO_EMOJI}>`;

const embed = new EmbedBuilder()
.setColor("#0000FF")
const giveawayTitle =
    type === "casino"
        ? `Giveaway: ${prize}`
        : `Giveaway: ${prize}`;

const embed = new EmbedBuilder()
    .setColor("#0000FF")
    .setDescription(
`# ${giveawayTitle}

Cliquez sur le bouton ${emoji} pour participer
*Nombre de gagnants:* ${winnersCount}

## Fin du giveaway
<t:${Math.floor(endAt / 1000)}:R>`
);
        const giveaway =
            await Giveaway.create({
                guildId: interaction.guild.id,
                channelId: interaction.channel.id,
                prize,
                type,
                winnersCount,
                endAt,
                participants: []
            });

        const row = new ActionRowBuilder()
.addComponents(
    new ButtonBuilder()
        .setCustomId(`gw_${giveaway._id}`)
        .setStyle(ButtonStyle.Secondary)
        .setEmoji(
            type === "casino"
            ? CASINO_EMOJI
            : NITRO_EMOJI
        )
        .setLabel("0")
);
        const message =
            await interaction.channel.send({
                embeds: [embed],
                components: [row]
            });

        giveaway.messageId = message.id;
        await giveaway.save();

        await interaction.reply({
            content: "✅ Giveaway créé.",
            ephemeral: true
        });
    }
};
