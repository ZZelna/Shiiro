const {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder
} = require("discord.js");

const Marriage = require("../../models/Marriage");
const Family = require("../../models/Family");

module.exports = {
    name: "divorce",

    async run(message) {

        const marriage = await Marriage.findOne({
            guildId: message.guild.id,
            users: message.author.id
        });

        if (!marriage)
            return message.reply("❌ Vous n'êtes pas marié.");

        const partnerId = marriage.users.find(id => id !== message.author.id);

        const embed = new EmbedBuilder()
            .setColor("#ff5555")
            .setTitle("💔 Divorce")
            .setDescription(
                `Êtes-vous certain de vouloir divorcer de <@${partnerId}> ?\n\nCette action est irréversible.`
            );

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId("divorce_yes")
                .setLabel("Confirmer")
                .setStyle(ButtonStyle.Danger),

            new ButtonBuilder()
                .setCustomId("divorce_no")
                .setLabel("Annuler")
                .setStyle(ButtonStyle.Secondary)
        );

        const msg = await message.reply({
            embeds: [embed],
            components: [row]
        });

        const collector = msg.createMessageComponentCollector({
            time: 30000
        });

        collector.on("collect", async interaction => {

            if (interaction.user.id !== message.author.id)
                return interaction.reply({
                    content: "❌ Cette confirmation ne vous appartient pas.",
                    ephemeral: true
                });

            if (interaction.customId === "divorce_no") {

                collector.stop();

                return interaction.update({
                    content: "❌ Divorce annulé.",
                    embeds: [],
                    components: []
                });

            }

            await Marriage.deleteOne({
                _id: marriage._id
            });

            await Family.deleteOne({
                marriageId: marriage._id
            });

            collector.stop();

            return interaction.update({
                embeds: [
                    new EmbedBuilder()
                        .setColor("Green")
                        .setTitle("💔 Divorce")
                        .setDescription("Le divorce a été prononcé.")
                ],
                components: []
            });

        });

        collector.on("end", async (_, reason) => {

            if (reason !== "time") return;

            await msg.edit({
                embeds: [
                    EmbedBuilder.from(embed)
                        .setDescription("⌛ Temps écoulé.")
                ],
                components: []
            }).catch(() => {});

        });

    }
};
