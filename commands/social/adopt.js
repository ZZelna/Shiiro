const {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");

const Marriage = require("../../models/Marriage");
const Family = require("../../models/Family");
const Child = require("../../models/Child");

module.exports = {
    name: "adopt",

    async run(message) {

        const target = message.mentions.members.first();

        if (!target)
            return message.reply("❌ Mentionnez un membre à adopter.");

        if (target.user.bot)
            return message.reply("❌ Vous ne pouvez pas adopter un bot.");

        if (target.id === message.author.id)
            return message.reply("❌ Vous ne pouvez pas vous adopter vous-même.");

        const marriage = await Marriage.findOne({
            guildId: message.guild.id,
            users: message.author.id
        });

        if (!marriage)
            return message.reply("❌ Vous devez être marié.");

        const family = await Family.findOne({
            marriageId: marriage._id
        });

        if (!family)
            return message.reply("❌ Vous n'avez pas encore de famille.");

        const alreadyChild = await Child.findOne({
            familyId: family._id,
            userId: target.id
        });

        if (alreadyChild)
            return message.reply("❌ Cette personne fait déjà partie de votre famille.");

        if (family.children.length >= (family.maxChildren || 10))
            return message.reply("❌ Votre famille est complète.");

        const embed = new EmbedBuilder()
            .setColor("#8BC34A")
            .setTitle("👶 Demande d'adoption")
            .setDescription(
                `${target}, ${message.author} souhaite vous adopter dans sa famille.\n\n` +
                "Acceptez-vous cette demande ?"
            );

        const row = new ActionRowBuilder().addComponents(

            new ButtonBuilder()
                .setCustomId("adopt_yes")
                .setLabel("Accepter")
                .setEmoji("✅")
                .setStyle(ButtonStyle.Success),

            new ButtonBuilder()
                .setCustomId("adopt_no")
                .setLabel("Refuser")
                .setEmoji("❌")
                .setStyle(ButtonStyle.Danger)

        );

        const msg = await message.reply({
            embeds: [embed],
            components: [row]
        });

        const collector = msg.createMessageComponentCollector({
            time: 60000
        });

        collector.on("collect", async interaction => {

            if (interaction.user.id !== target.id)
                return interaction.reply({
                    content: "❌ Cette demande ne vous est pas destinée.",
                    ephemeral: true
                });

            if (interaction.customId === "adopt_no") {

                collector.stop();

                return interaction.update({
                    embeds: [
                        EmbedBuilder.from(embed)
                            .setColor("Red")
                            .setDescription("❌ La demande d'adoption a été refusée.")
                    ],
                    components: []
                });

            }

            const child = await Child.create({

                guildId: message.guild.id,

                familyId: family._id,

                userId: target.id,

                adopted: true,

                name: target.displayName,

                gender: "Inconnu"

            });

            family.children.push(child._id);

            family.members.push(target.id);

            family.xp += 100;

            if (family.xp >= family.level * 1000) {
                family.level++;
                family.xp = 0;
            }

            await family.save();

            collector.stop();

            return interaction.update({

                embeds: [

                    new EmbedBuilder()

                        .setColor("Green")

                        .setTitle("👶 Adoption")

                        .setDescription(
                            `${target} rejoint officiellement la famille **${family.name}** !`
                        )

                        .addFields(

                            {
                                name: "👨‍👩‍👧 Parents",
                                value: marriage.users
                                    .map(id => `<@${id}>`)
                                    .join("\n")
                            },

                            {
                                name: "👶 Enfants",
                                value: family.children.length.toString(),
                                inline: true
                            },

                            {
                                name: "⭐ Niveau",
                                value: family.level.toString(),
                                inline: true
                            }

                        )

                        .setTimestamp()

                ],

                components: []

            });

        });

        collector.on("end", async (_, reason) => {

            if (reason !== "time") return;

            await msg.edit({
                embeds: [
                    EmbedBuilder.from(embed)
                        .setColor("Orange")
                        .setDescription("⌛ La demande d'adoption a expiré.")
                ],
                components: []
            }).catch(() => {});

        });

    }
};
