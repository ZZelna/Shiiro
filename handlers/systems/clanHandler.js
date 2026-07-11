const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require("discord.js");
const Clan = require("../../models/Clan");
const CasinoProfile = require("../../models/CasinoProfile");

const LOGS_CLAN = "1520771804610822234";

module.exports = async function handleClanInteraction(interaction) {

    // Ouvre le modal de création de clan
    if (interaction.isButton() && interaction.customId === "create_clan") {
        const modal = new ModalBuilder()
            .setCustomId("create_clan_modal")
            .setTitle("Créer un clan");

        const clanName = new TextInputBuilder()
            .setCustomId("clan_name")
            .setLabel("Nom du clan")
            .setStyle(TextInputStyle.Short)
            .setMinLength(3)
            .setMaxLength(20)
            .setRequired(true);

        modal.addComponents(new ActionRowBuilder().addComponents(clanName));

        return interaction.showModal(modal);
    }

    // Soumission du modal de création
    if (interaction.isModalSubmit() && interaction.customId === "create_clan_modal") {

        const clanName = interaction.fields.getTextInputValue("clan_name");

        const profile = await CasinoProfile.findOne({ userId: interaction.user.id });

        if (!profile || profile.yens < 10000) {
            return interaction.reply({
                content: "❌ Il faut 10 000 ¥ pour créer un clan.",
                ephemeral: true
            });
        }

        const alreadyClan = await Clan.findOne({ members: interaction.user.id });

        if (alreadyClan) {
            return interaction.reply({
                content: "❌ Tu possèdes déjà un clan.",
                ephemeral: true
            });
        }

        profile.yens -= 10000;
        await profile.save();

        const categoryId = "1519061386192224376";

        const channel = await interaction.guild.channels.create({
            name: `🏰・${clanName}`,
            type: 0,
            parent: categoryId,
            permissionOverwrites: [
                { id: interaction.guild.id, deny: ["ViewChannel"] },
                {
                    id: interaction.user.id,
                    allow: ["ViewChannel", "SendMessages", "ReadMessageHistory"]
                }
            ]
        });

        const clan = await Clan.create({
            name: clanName,
            ownerId: interaction.user.id,
            members: [interaction.user.id],
            channelId: channel.id
        });

        console.log("Clan créé :", clan);

        await channel.send({
            content: `👑 Bienvenue <@${interaction.user.id}> dans le clan **${clanName}** !`
        });

        return interaction.reply({
            content: `✅ Clan **${clanName}** créé avec succès.\n📍 Salon : ${channel}`,
            ephemeral: true
        });
    }

    // Accepter une invitation
    if (interaction.isButton() && interaction.customId.startsWith("clan_accept_")) {

        const [, , clanId, targetId] = interaction.customId.split("_");

        if (interaction.user.id !== targetId) {
            return interaction.reply({
                content: "❌ Cette invitation ne t'est pas destinée.",
                ephemeral: true
            });
        }

        const clan = await Clan.findById(clanId);

        if (!clan) {
            return interaction.reply({ content: "❌ Clan introuvable.", ephemeral: true });
        }

        const alreadyClan = await Clan.findOne({ members: interaction.user.id });

        if (alreadyClan) {
            return interaction.reply({ content: "❌ Tu es déjà dans un clan.", ephemeral: true });
        }

        if (clan.members.length >= 5) {
            return interaction.reply({
                content: "❌ Ce clan est déjà complet (5/5 membres).",
                ephemeral: true
            });
        }

        clan.members.push(interaction.user.id);
        await clan.save();

        const channel = await interaction.guild.channels.fetch(clan.channelId);

        if (channel) {
            await channel.permissionOverwrites.create(interaction.user.id, {
                ViewChannel: true,
                SendMessages: true,
                ReadMessageHistory: true
            });

            await channel.send({
                content: `👋 Bienvenue <@${interaction.user.id}> dans **${clan.name}** !`
            });
        }

        await interaction.update({
            content: `✅ Tu as rejoint **${clan.name}**.`,
            embeds: [],
            components: []
        });

        try {
            const logsGuild = interaction.client.guilds.cache.find(g =>
                g.channels.cache.has(LOGS_CLAN)
            );
            const logsChannel = logsGuild?.channels.cache.get(LOGS_CLAN);
            if (logsChannel) {
                await logsChannel.send({
                    content: `\`\`\`- Invitation acceptée.\nUtilisateur: ${interaction.user.username} (ID: ${interaction.user.id})\nClan: ${clan.name} (ID: ${clan._id})\nMembres: ${clan.members.length}/5\nAction: Membre ajouté au clan. ✅\`\`\``
                });
            }
        } catch {}
        return;
    }

    // Refuser une invitation
    if (interaction.isButton() && interaction.customId.startsWith("clan_decline_")) {

        const [, , clanId, targetId] = interaction.customId.split("_");

        if (interaction.user.id !== targetId) {
            return interaction.reply({
                content: "❌ Cette invitation ne t'est pas destinée.",
                ephemeral: true
            });
        }

        const clan = await Clan.findById(clanId);

        await interaction.update({
            content: "❌ Tu as refusé l'invitation du clan.",
            embeds: [],
            components: []
        });

        try {
            const logsGuild = interaction.client.guilds.cache.find(g =>
                g.channels.cache.has(LOGS_CLAN)
            );
            const logsChannel = logsGuild?.channels.cache.get(LOGS_CLAN);
            if (logsChannel) {
                await logsChannel.send({
                    content: `\`\`\`- Invitation refusée.\nUtilisateur: ${interaction.user.username} (ID: ${interaction.user.id})\nClan: ${clan?.name ?? "Inconnu"} (ID: ${clanId})\nAction: Invitation déclinée. ❌\`\`\``
                });
            }
        } catch {}
        return;
    }

    // Confirmer la suppression du clan
    if (interaction.isButton() && interaction.customId.startsWith("deleteclan_confirm_")) {

        const clanId = interaction.customId.replace("deleteclan_confirm_", "");
        const clan = await Clan.findById(clanId);

        if (!clan) {
            return interaction.reply({ content: "❌ Clan introuvable.", ephemeral: true });
        }

        if (clan.ownerId !== interaction.user.id) {
            return interaction.reply({ content: "❌ Tu n'es pas le chef de ce clan.", ephemeral: true });
        }

        try {
            const channel = await interaction.guild.channels.fetch(clan.channelId);
            if (channel) await channel.delete();
        } catch {}

        await Clan.deleteOne({ _id: clan._id });

        await interaction.update({
            content: `🗑️ Le clan **${clan.name}** a été supprimé.`,
            embeds: [],
            components: []
        });

        try {
            const logsGuild = interaction.client.guilds.cache.find(g =>
                g.channels.cache.has(LOGS_CLAN)
            );
            const logsChannel = logsGuild?.channels.cache.get(LOGS_CLAN);
            if (logsChannel) {
                await logsChannel.send({
                    content: `\`\`\`- Clan supprimé.\nChef: ${interaction.user.username} (ID: ${interaction.user.id})\nClan: ${clan.name} (ID: ${clan._id})\nAction: Clan et salon supprimés. 🗑️\`\`\``
                });
            }
        } catch {}
        return;
    }

    // Annuler la suppression
    if (interaction.isButton() && interaction.customId.startsWith("deleteclan_cancel_")) {
        return interaction.update({
            content: "❌ Suppression annulée.",
            embeds: [],
            components: []
        });
    }
};
