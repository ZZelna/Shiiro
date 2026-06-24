const {
    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");

const Clan = require("../models/Clan");
const CasinoProfile = require("../models/CasinoProfile");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("invite")
        .setDescription("Inviter un joueur dans votre clan")
        .addUserOption(option =>
            option
                .setName("joueur")
                .setDescription("Joueur à inviter")
                .setRequired(true)
        ),

    async execute(interaction) {

        const target =
            interaction.options.getUser(
                "joueur"
            );

        const clan =
            await Clan.findOne({
                members: interaction.user.id
            });

        if (!clan) {
            return interaction.reply({
                content:
                    "❌ Tu n'es dans aucun clan.",
                ephemeral: true
            });
        }

        const profile =
            await CasinoProfile.findOne({
                userId: target.id
            });

        if (!profile) {
            return interaction.reply({
                content:
                    "❌ Ce joueur n'a pas de profil casino.",
                ephemeral: true
            });
        }

        const alreadyClan =
            await Clan.findOne({
                members: target.id
            });

        if (alreadyClan) {
            return interaction.reply({
                content:
                    "❌ Ce joueur est déjà dans un clan.",
                ephemeral: true
            });
        }

        const embed =
            new EmbedBuilder()
                .setColor("Blue")
                .setTitle("⚔️ Invitation de Clan")
                .setDescription(
                    `${target}, **${interaction.user.username}** t'invite à rejoindre le clan **${clan.name}**.`
                );

        const row =
            new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId(
                            `clan_accept_${clan._id}_${target.id}`
                        )
                        .setLabel("Accepter")
                        .setStyle(
                            ButtonStyle.Success
                        ),

                    new ButtonBuilder()
                        .setCustomId(
                            `clan_decline_${clan._id}_${target.id}`
                        )
                        .setLabel("Refuser")
                        .setStyle(
                            ButtonStyle.Danger
                        )
                );

        await interaction.reply({
            embeds: [embed],
            components: [row]
        });
    }
};
