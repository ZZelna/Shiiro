const {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder
} = require("discord.js");

const Marriage = require("../../models/Marriage");
const Family = require("../../models/Family");
const Child = require("../../models/Child");

module.exports = {

    name: "divorce",

    async run(message) {

        const marriage = await Marriage.findOne({
            guildId: message.guild.id,
            users: message.author.id
        });

        if (!marriage)
            return message.reply("❌ Vous n'êtes pas marié.");

        const partnerId = marriage.users.find(
            id => id !== message.author.id
        );

        const embed = new EmbedBuilder()

            .setColor("#E74C3C")

            .setTitle("💔 Divorce")

            .setDescription(
                `Êtes-vous certain de vouloir divorcer de <@${partnerId}> ?\n\n⚠️ Cette action supprimera également votre famille et tous vos enfants.`
            );

        const row = new ActionRowBuilder()

            .addComponents(

                new ButtonBuilder()

                    .setCustomId("divorce_yes")

                    .setLabel("Confirmer")

                    .setEmoji("💔")

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

                collector.stop("cancel");

                return interaction.update({
                    embeds: [
                        new EmbedBuilder()
                            .setColor("Orange")
                            .setTitle("💔 Divorce")
                            .setDescription("Le divorce a été annulé.")
                    ],
                    components: []
                });

            }

            const family = await Family.findOne({
                marriageId: marriage._id
            });

            if (family) {

                await Child.deleteMany({
                    familyId: family._id
                });

                await Family.deleteOne({
                    _id: family._id
                });

            }

            await Marriage.deleteOne({
                _id: marriage._id
            });

            collector.stop("confirmed");

            return interaction.update({

                embeds: [

                    new EmbedBuilder()

                        .setColor("Green")

                        .setTitle("💔 Divorce")

                        .setDescription(
                            "Le divorce a été prononcé.\n\nVotre famille et vos enfants ont été supprimés."
                        )

                ],

                components: []

            });

        });

        collector.on("end", async (_, reason) => {

            if (reason !== "time")
                return;

            await msg.edit({

                embeds: [

                    EmbedBuilder.from(embed)

                        .setColor("Orange")

                        .setDescription("⌛ Le délai de confirmation est expiré.")

                ],

                components: []

            }).catch(() => {});

        });

    }

};
