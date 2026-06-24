const {
    SlashCommandBuilder,
    EmbedBuilder
} = require("discord.js");

const Clan =
    require("../models/Clan");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("leave")
        .setDescription(
            "Quitter son clan"
        ),

    async execute(interaction) {

        const clan =
            await Clan.findOne({
                members:
                interaction.user.id
            });

        if (!clan) {

            return interaction.reply({
                content:
                    "❌ Tu n'es dans aucun clan.",
                ephemeral: true
            });

        }

        if (
            clan.ownerId ===
            interaction.user.id
        ) {

            return interaction.reply({
                content:
                    "❌ Le chef du clan ne peut pas quitter son clan.\nUtilise `/transfer` ou `/deleteclan`.",
                ephemeral: true
            });

        }

        clan.members =
            clan.members.filter(
                id =>
                    id !==
                    interaction.user.id
            );

        await clan.save();

        try {

            const channel =
                await interaction.guild.channels.fetch(
                    clan.channelId
                );

            if (channel) {

                await channel.permissionOverwrites.delete(
                    interaction.user.id
                );

                await channel.send({
                    content:
                        `👋 <@${interaction.user.id}> a quitté le clan.`
                });

            }

        } catch (err) {
            console.log(err);
        }

        const embed =
            new EmbedBuilder()
                .setColor("Orange")
                .setTitle(
                    "👋 Clan quitté"
                )
                .setDescription(
                    `Tu as quitté **${clan.name}**.`
                );

        return interaction.reply({
            embeds: [embed],
            ephemeral: true
        });
    }
};
