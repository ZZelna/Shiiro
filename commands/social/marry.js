const {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder
} = require("discord.js");

const Marriage = require("../../models/Marriage");
const requests = require("../../systems/marriage/requests");

module.exports = {
    name: "marry",

    async run(message, args) {

        let target = null;

        // Mention
        const mention = message.mentions.users.first();

        if (mention) {
            target = await message.guild.members
                .fetch(mention.id)
                .catch(() => null);
        }

        // ID
        if (!target && args[0]) {
            const id = args[0].replace(/[<@!>]/g, "");

            target = await message.guild.members
                .fetch(id)
                .catch(() => null);
        }

        if (!target)
            return message.reply("❌ Mentionnez un utilisateur.");

        if (target.id === message.author.id)
            return message.reply("❌ Vous ne pouvez pas vous épouser.");

        if (target.user.bot)
            return message.reply("❌ Vous ne pouvez pas épouser un bot.");

        const authorMarriage = await Marriage.findOne({
            guildId: message.guild.id,
            users: message.author.id
        });

        if (authorMarriage)
            return message.reply("❌ Vous êtes déjà marié.");

        const targetMarriage = await Marriage.findOne({
            guildId: message.guild.id,
            users: target.id
        });

        if (targetMarriage)
            return message.reply("❌ Cette personne est déjà mariée.");

        const requestKey = `${message.author.id}_${target.id}`;

        if (requests.has(requestKey))
            return message.reply("❌ Une demande est déjà en attente.");

        requests.set(requestKey, true);

        const embed = new EmbedBuilder()
            .setColor("#ff69b4")
            .setTitle("💍 Demande en mariage")
            .setDescription(
                `${target}, ${message.author} souhaite vous épouser.\n\nCliquez sur **Accepter** ou **Refuser** ci-dessous.`
            )
            .setFooter({
                text: "Cette demande expire dans 60 secondes."
            });

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId("marry_accept")
                .setLabel("Accepter")
                .setEmoji("💍")
                .setStyle(ButtonStyle.Success),

            new ButtonBuilder()
                .setCustomId("marry_refuse")
                .setLabel("Refuser")
                .setEmoji("❌")
                .setStyle(ButtonStyle.Danger)
        );

        const msg = await message.channel.send({
            embeds: [embed],
            components: [row]
        });

        const collector = msg.createMessageComponentCollector({
            time: 60000
        });

        collector.on("collect", async interaction => {

            if (interaction.user.id !== target.id) {
                return interaction.reply({
                    content: "❌ Cette demande ne vous est pas destinée.",
                    ephemeral: true
                });
            }

            if (interaction.customId === "marry_refuse") {

                requests.delete(requestKey);
                collector.stop("refused");

                return interaction.update({
                    embeds: [
                        EmbedBuilder.from(embed)
                            .setColor("Red")
                            .setDescription("❌ La demande en mariage a été refusée.")
                    ],
                    components: []
                });
            }

            if (interaction.customId === "marry_accept") {

                requests.delete(requestKey);
                collector.stop("accepted");

                await Marriage.create({
                    guildId: message.guild.id,
                    users: [message.author.id, target.id],
                    proposerId: message.author.id,
                    createdAt: new Date()
                });

                return interaction.update({
                    embeds: [
                        new EmbedBuilder()
                            .setColor("Green")
                            .setTitle("💍 Mariage")
                            .setDescription(
                                `🎉 Félicitations ${message.author} ❤️ ${target}\n\nVous êtes désormais mariés !`
                            )
                    ],
                    components: []
                });
            }

        });

        collector.on("end", async (_, reason) => {

            requests.delete(requestKey);

            if (reason !== "time") return;

            await msg.edit({
                embeds: [
                    EmbedBuilder.from(embed)
                        .setColor("Orange")
                        .setDescription("⌛ La demande en mariage a expiré.")
                ],
                components: []
            }).catch(() => {});
        });

    }
};
