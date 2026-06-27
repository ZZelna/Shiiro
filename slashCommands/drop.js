const {
    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");

const Economy = require("../models/Economy");

module.exports = {

    data: new SlashCommandBuilder()
        .setName("drop")
        .setDescription("Lance un drop."),

    async execute(interaction) {

        const button =
            new ButtonBuilder()
            .setCustomId("claim_drop")
            .setLabel("🎉 Récupérer")
            .setStyle(ButtonStyle.Success);

        const row =
            new ActionRowBuilder()
            .addComponents(button);

        const embed =
            new EmbedBuilder()

            .setColor("Gold")

            .setTitle("🎁 DROP")

            .setDescription(
                "Le premier à cliquer sur **🎉 Récupérer** gagne une récompense !"
            );

        const msg =
            await interaction.reply({
                embeds: [embed],
                components: [row],
                fetchReply: true
            });

        const collector =
            msg.createMessageComponentCollector({
                time: 60000,
                max: 1
            });

        collector.on("collect", async i => {

            const random =
                Math.random();

            let reward = "";
            let value = 0;

            let user =
                await Economy.findOne({
                    userId: i.user.id
                });

            if (!user) {

                user =
                    await Economy.create({
                        userId: i.user.id,
                        yens: 0,
                        gifts: 0,
                        boosters: 0
                    });

            }

            if (random < 0.60) {

                value =
                    Math.floor(
                        Math.random() * 4000
                    ) + 1000;

                user.yens += value;

                reward =
                    `💴 **${value} Yens**`;

            } else if (random < 0.90) {

                user.gifts += 1;

                reward =
                    "🎁 **1 Gift**";

            } else {

                user.boosters += 1;

                reward =
                    "💰 **1 Doubleur de Yens**";

            }

            await user.save();

            button.setDisabled(true);

            await i.update({

                embeds: [

                    new EmbedBuilder()

                    .setColor("Green")

                    .setTitle("🎉 Drop récupéré")

                    .setDescription(
                        `${i.user} a remporté ${reward} !`
                    )

                ],

                components: [
                    new ActionRowBuilder()
                    .addComponents(button)
                ]

            });

        });

        collector.on("end", async collected => {

            if (collected.size > 0)
                return;

            button.setDisabled(true);

            await msg.edit({

                embeds: [

                    new EmbedBuilder()

                    .setColor("Red")

                    .setTitle("❌ Drop expiré")

                    .setDescription(
                        "Personne n'a récupéré le drop."
                    )

                ],

                components: [
                    new ActionRowBuilder()
                    .addComponents(button)
                ]

            }).catch(() => {});

        });

    }

};
