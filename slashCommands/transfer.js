const {
    SlashCommandBuilder,
    EmbedBuilder
} = require("discord.js");

const Clan =
    require("../models/Clan");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("transfer")
        .setDescription(
            "Transférer la propriété du clan"
        )
        .addUserOption(option =>
            option
                .setName("joueur")
                .setDescription(
                    "Nouveau chef du clan"
                )
                .setRequired(true)
        ),

    async execute(interaction) {

        const target =
            interaction.options.getUser(
                "joueur"
            );

        const clan =
            await Clan.findOne({
                ownerId:
                interaction.user.id
            });

        if (!clan) {

            return interaction.reply({
                content:
                    "❌ Tu n'es pas chef d'un clan.",
                ephemeral: true
            });

        }

        if (
            target.id ===
            interaction.user.id
        ) {

            return interaction.reply({
                content:
                    "❌ Tu es déjà le chef du clan.",
                ephemeral: true
            });

        }

        if (
            !clan.members.includes(
                target.id
            )
        ) {

            return interaction.reply({
                content:
                    "❌ Ce joueur n'est pas dans ton clan.",
                ephemeral: true
            });

        }

        clan.ownerId =
            target.id;

        await clan.save();

        try {

            const channel =
                await interaction.guild.channels.fetch(
                    clan.channelId
                );

            if (channel) {

                await channel.send({
                    embeds: [
                        new EmbedBuilder()
                            .setColor("Gold")
                            .setTitle(
                                "👑 Nouveau Chef"
                            )
                            .setDescription(
                                `${interaction.user} a transféré la propriété du clan à ${target}.`
                            )
                    ]
                });

            }

        } catch (err) {

            console.log(err);

        }

        const embed =
            new EmbedBuilder()
                .setColor("Green")
                .setTitle(
                    "✅ Propriété transférée"
                )
                .setDescription(
                    `${target} est désormais le chef du clan **${clan.name}**.`
                );

        return interaction.reply({
            embeds: [embed]
        });

    }
};
