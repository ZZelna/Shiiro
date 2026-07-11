const { EmbedBuilder } = require("discord.js");
const CasinoProfile = require("../../models/CasinoProfile");
const Clan = require("../../models/Clan");

const LOGS_CASINO = "1520766436388245585";

module.exports = async function handleCasinoInteraction(interaction) {

    // =========================
    // CRÉATION DU PROFIL CASINO
    // =========================
    if (interaction.isButton() && interaction.customId === "create_profile") {
        const roleId = "1507055410211848213";

        const existing = await CasinoProfile.findOne({ userId: interaction.user.id });

        if (existing) {
            return interaction.reply({
                content: "❌ Tu possèdes déjà un profil casino.",
                ephemeral: true
            });
        }

        await CasinoProfile.create({
            userId: interaction.user.id,
            yens: 1000,
            gifts: 0
        });

        await interaction.member.roles.add(roleId);

        await interaction.reply({
            content: "✅ Ton profil casino a été créé avec succès.\n💴 Tu reçois **1000 ¥** de bienvenue.",
            ephemeral: true
        });

        try {
            const logsGuild = interaction.client.guilds.cache.find(g =>
                g.channels.cache.has(LOGS_CASINO)
            );
            const logsChannel = logsGuild?.channels.cache.get(LOGS_CASINO);
            if (logsChannel) {
                await logsChannel.send({
                    content: `\`\`\`- Profil casino créé.\nUtilisateur: ${interaction.user.username} (ID: ${interaction.user.id})\nSolde initial: 1 000 ¥\nAction: Profil créé et rôle attribué. ✅\`\`\``
                });
            }
        } catch {}
        return;
    }

    // =========================
    // OUVERTURE DES GIFTS
    // =========================
    if (interaction.isButton() && interaction.customId.startsWith("gift_open_")) {

        const userId = interaction.customId.replace("gift_open_", "");

        if (interaction.user.id !== userId) {
            return interaction.reply({
                content: "❌ Ce cadeau ne t'appartient pas.",
                ephemeral: true
            });
        }

        const profile = await CasinoProfile.findOne({ userId: interaction.user.id });

        if (!profile || profile.gifts <= 0) {
            return interaction.reply({
                content: "❌ Tu ne possèdes aucun Gift.",
                ephemeral: true
            });
        }

        profile.gifts -= 1;
        await profile.save();

        const rewards = [
            { chance: 20, roleId: "1519383713014878279", name: "🔊 Perm VOC Chat" },
            { chance: 15, roleId: "1519633537156907088", name: "🖼️ Perm Pic" },
            { chance: 15, roleId: "1519633572850438225", name: "🎨 Perm Banner" },
            { chance: 10, roleId: "1523705733567479909", name: "✨ Perm Animation" },
            { chance: 10, roleId: "1513950039289106502", name: "✏️ Perm Rename" },
            { chance: 15, roleId: "1519383437419610332", name: "💴 50 000 ¥" },
            { chance: 8, roleId: "1519383482113982474", name: "💴 100 000 ¥" },
            { chance: 4, roleId: "1519383516658405456", name: "💴 250 000 ¥" },
            { chance: 2, roleId: "1519383549223108618", name: "💴 500 000 ¥" },
            { chance: 1, roleId: "1519383582198464593", name: "💴 1 000 000 ¥" }
        ];

        let roll = Math.random() * 100;
        let cumulative = 0;
        let reward = null;

        for (const item of rewards) {
            cumulative += item.chance;
            if (roll <= cumulative) {
                reward = item;
                break;
            }
        }

        const role = interaction.guild.roles.cache.get(reward.roleId);

        let rewardText = reward.name;
        let logAction = "";

        if (role && interaction.member.roles.cache.has(role.id)) {

            profile.yens += 5000;
            await profile.save();

            rewardText = `${reward.name}\n\n💰 Récompense déjà possédée\n➜ Compensation : 5 000 ¥`;
            logAction = `Récompense déjà possédée — Compensation : 5 000 ¥`;

            await interaction.channel.send({
                content: `<@&1506709088451690708> <@&1506674274826584284>\n\n⚠️ ${interaction.user} possédait déjà **${reward.name}**.\n\n💰 Une compensation de **5 000 ¥** lui a été accordée.`
            });

        } else if (role) {

            await interaction.member.roles.add(role);

            const yensRoles = [
                "1519383437419610332",
                "1519383482113982474",
                "1519383516658405456",
                "1519383549223108618",
                "1519383582198464593"
            ];

            if (yensRoles.includes(role.id)) {
                await interaction.channel.send({
                    content: `<@&1506709088451690708> <@&1506674274826584284>\n\n🎁 ${interaction.user} a obtenu **${reward.name}**.`
                });
            }

            logAction = "Rôle attribué.";
        }

        const resultEmbed = new EmbedBuilder()
            .setColor("Gold")
            .setTitle("🎁 Cadeau Ouvert")
            .setDescription(rewardText)
            .addFields({
                name: "🎁 Gifts restants",
                value: `${profile.gifts}`,
                inline: true
            })
            .setImage(
                "https://cdn.discordapp.com/attachments/1516128872243134696/1519637866391797790/IMG_8903.png"
            );

        await interaction.update({
            embeds: [resultEmbed],
            components: []
        });

        try {
            const logsGuild = interaction.client.guilds.cache.find(g =>
                g.channels.cache.has(LOGS_CASINO)
            );
            const logsChannel = logsGuild?.channels.cache.get(LOGS_CASINO);
            if (logsChannel) {
                await logsChannel.send({
                    content: `\`\`\`- Gift ouvert.\nUtilisateur: ${interaction.user.username} (ID: ${interaction.user.id})\nRécompense: ${reward.name}\nAction: ${logAction}\nGifts restants: ${profile.gifts}\`\`\``
                });
            }
        } catch {}
        return;
    }

    // =========================
    // BOUTIQUE
    // =========================
    if (interaction.isButton() && interaction.customId.startsWith("shop_buy_")) {

        try {
            const { SHOP_ITEMS } = require("../../slashCommands/shop");

            const itemId = interaction.customId.replace("shop_buy_", "");
            const item = SHOP_ITEMS.find(i => i.id === itemId);
            if (!item) return interaction.reply({ content: "❌ Article introuvable.", ephemeral: true });

            const profile = await CasinoProfile.findOne({ userId: interaction.user.id });
            if (!profile) return interaction.reply({ content: "❌ Tu n'as pas de profil casino.", ephemeral: true });

            if (profile.yens < item.price) {
                return interaction.reply({
                    content: `❌ Solde insuffisant. Il te faut **${item.price.toLocaleString()} ¥** (tu as **${profile.yens.toLocaleString()} ¥**).`,
                    ephemeral: true
                });
            }

            const member = await interaction.guild.members.fetch(interaction.user.id);

            if (member.roles.cache.has(item.roleId)) {
                return interaction.reply({ content: "❌ Tu possèdes déjà cet article.", ephemeral: true });
            }

            profile.yens -= item.price;
            await profile.save();

            await member.roles.add(item.roleId).catch(() => null);

            await interaction.reply({
                content: `✅ Tu as acheté **${item.label}** pour **${item.price.toLocaleString()} ¥** !\n💴 Solde restant : \`${profile.yens.toLocaleString()} ¥\``,
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
                            "+ Achat boutique.\n" +
                            `Acheteur: ${interaction.user.username} (ID: ${interaction.user.id})\n` +
                            `Article: ${item.label}\n` +
                            `Prix: ${item.price.toLocaleString()} ¥\n` +
                            `Solde restant: ${profile.yens.toLocaleString()} ¥\n` +
                            "Action: Rôle attribué. ✅\n" +
                            "```"
                    });
                }
            } catch (err) {
                console.error("Erreur logs shop :", err);
            }

            return;

        } catch (err) {
            console.error("Erreur boutique :", err);

            if (interaction.replied || interaction.deferred) {
                await interaction.editReply({ content: "❌ Une erreur est survenue." }).catch(() => {});
            } else {
                await interaction.reply({ content: "❌ Une erreur est survenue.", ephemeral: true });
            }
        }
        return;
    }

    // =========================
    // BOUNTY
    // =========================
    if (interaction.isButton() && interaction.customId.startsWith("bounty_claim_")) {

        const parts = interaction.customId.split("_");
        const targetId = parts[2];
        const posterId = parts[3];
        const amount = parseInt(parts[4]);

        if (interaction.user.id === targetId) {
            return interaction.reply({
                content: "❌ Tu ne peux pas réclamer ta propre prime.",
                ephemeral: true
            });
        }

        if (interaction.user.id === posterId) {
            return interaction.reply({
                content: "❌ Tu ne peux pas réclamer une prime que tu as posée.",
                ephemeral: true
            });
        }

        const clan = await Clan.findOne({ members: interaction.user.id });
        if (!clan) {
            return interaction.reply({
                content: "❌ Tu dois être dans un clan pour réclamer une prime.",
                ephemeral: true
            });
        }

        const profile = await CasinoProfile.findOneAndUpdate(
            { userId: interaction.user.id },
            { $setOnInsert: { userId: interaction.user.id } },
            { upsert: true, new: true }
        );

        profile.yens += amount;
        await profile.save();

        const claimedEmbed = new EmbedBuilder()
            .setColor("DarkGreen")
            .setTitle("✅ PRIME RÉCLAMÉE")
            .setDescription(`La prime sur <@${targetId}> a été réclamée par ${interaction.user} !`)
            .addFields(
                { name: "🏆 Chasseur", value: `${interaction.user} (Clan: **${clan.name}**)`, inline: true },
                { name: "💴 Récompense", value: `\`${amount.toLocaleString()} ¥\``, inline: true }
            )
            .setFooter({ text: "Shiiro Casino • Bounty", iconURL: interaction.guild.iconURL() })
            .setTimestamp();

        await interaction.update({ embeds: [claimedEmbed], components: [] });

        try {
            const logsGuild = interaction.client.guilds.cache.find(g =>
                g.channels.cache.has(LOGS_CASINO)
            );
            const logsChannel = logsGuild?.channels.cache.get(LOGS_CASINO);
            if (logsChannel) {
                await logsChannel.send({
                    content:
                        "```diff\n" +
                        "+ Prime réclamée.\n" +
                        `Chasseur: ${interaction.user.username} (ID: ${interaction.user.id})\n` +
                        `Clan: ${clan.name}\n` +
                        `Cible: <@${targetId}> (ID: ${targetId})\n` +
                        `Montant: ${amount.toLocaleString()} ¥\n` +
                        "Action: Yens transférés au chasseur. ✅\n" +
                        "```"
                });
            }
        } catch (err) {
            console.error("Erreur logs bounty claim :", err);
        }
        return;
    }
};
