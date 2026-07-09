const {
    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");

const CasinoProfile = require("../models/CasinoProfile");
const Bounty = require("../models/Bounty");

const BOUNTY_CHANNEL = "1519247019246616598";
const LOGS_CASINO = "1520766436388245585";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("bounty")
        .setDescription("Pose une prime sur un membre.")
        .addUserOption(option =>
            option.setName("cible")
                .setDescription("Le membre sur qui poser la prime.")
                .setRequired(true)
        )
        .addIntegerOption(option =>
            option.setName("montant")
                .setDescription("Montant de la prime en yens.")
                .setMinValue(1000)
                .setRequired(true)
        ),

    async execute(interaction) {
          const ALLOWED_CHANNEL = "1519247019246616598";

    if (interaction.channelId !== ALLOWED_CHANNEL) {

        return interaction.reply({

            content: "❌ Cette commande est uniquement utilisable dans <#1523677940750225508>.",

            ephemeral: true

        });

    }

    const target = interaction.options.getUser("cible");

    const amount = interaction.options.getInteger("montant");

        if (target.id === interaction.user.id) {
            return interaction.reply({
                content: "❌ Tu ne peux pas poser une prime sur toi-même.",
                ephemeral: true
            });
        }

        if (target.bot) {
            return interaction.reply({
                content: "❌ Tu ne peux pas poser une prime sur un bot.",
                ephemeral: true
            });
        }

        // ✅ Vérification prime déjà active
        const existing = await Bounty.findOne({ targetId: target.id });
        if (existing) {
            return interaction.reply({
                content: `❌ Une prime est déjà active sur ${target} (**${existing.amount.toLocaleString()} ¥**).`,
                ephemeral: true
            });
        }

        // ✅ Vérification solde
        const poster = await CasinoProfile.findOne({ userId: interaction.user.id });
        if (!poster || poster.yens < amount) {
            return interaction.reply({
                content: `❌ Solde insuffisant. Tu as **${(poster?.yens ?? 0).toLocaleString()} ¥**.`,
                ephemeral: true
            });
        }

        // ✅ Prélèvement
        poster.yens -= amount;
        await poster.save();

        // ✅ Envoi embed
        const channel = interaction.guild.channels.cache.get(BOUNTY_CHANNEL);
        if (!channel) {
            return interaction.reply({
                content: "❌ Salon de prime introuvable.",
                ephemeral: true
            });
        }

        const embed = new EmbedBuilder()
            .setColor("DarkRed")
            .setTitle("🎯 PRIME ACTIVE")
            .setDescription(`Une prime a été posée sur **${target}** !\nPille cette personne d'au moins **${amount.toLocaleString()} ¥** pour la réclamer automatiquement.`)
            .addFields(
                { name: "🎯 Cible", value: `${target}`, inline: true },
                { name: "💴 Récompense", value: `\`${amount.toLocaleString()} ¥\``, inline: true },
                { name: "📌 Posée par", value: `${interaction.user}`, inline: true }
            )
            .setThumbnail(target.displayAvatarURL({ dynamic: true }))
            .setFooter({ text: "Shiiro Casino • Bounty — Pillage requis pour réclamer", iconURL: interaction.guild.iconURL() })
            .setTimestamp();

        const msg = await channel.send({ embeds: [embed] });

        // ✅ Sauvegarde en DB
        await Bounty.create({
            targetId: target.id,
            posterId: interaction.user.id,
            amount,
            messageId: msg.id
        });

        await interaction.reply({
            content: `✅ Prime de **${amount.toLocaleString()} ¥** posée sur ${target} !\nElle sera réclamée automatiquement dès que quelqu'un la pillera de ce montant.`,
            ephemeral: true
        });

        try {
            const logsGuild = interaction.client.guilds.cache.find(g =>
                g.channels.cache.has(LOGS_CASINO)
            );
            const logsChannel = logsGuild?.channels.cache.get(LOGS_CASINO);
            if (logsChannel) {
                await logsChannel.send({
                    content:
                        "```diff\n" +
                        "- Prime posée.\n" +
                        `Poseur: ${interaction.user.username} (ID: ${interaction.user.id})\n` +
                        `Cible: ${target.username} (ID: ${target.id})\n` +
                        `Montant: ${amount.toLocaleString()} ¥\n` +
                        "Action: Yens prélevés. 🎯\n" +
                        "```"
                });
            }
        } catch (err) {
            console.error("Erreur logs bounty :", err);
        }
    }
};
