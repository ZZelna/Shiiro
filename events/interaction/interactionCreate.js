const discordTranscripts = require("discord-html-transcripts");
const {
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    ActionRowBuilder,
    StringSelectMenuBuilder,
    EmbedBuilder,
    ButtonBuilder,
    ButtonStyle,
    ChannelType,
    PermissionsBitField
} = require("discord.js");

const fs = require("fs");
const path = require("path");
const transcripts = [];
const CasinoProfile =
    require("../../models/CasinoProfile");
const Clan =
require("../../models/Clan");
const configPath = path.join(
    __dirname,
    "../../config.json"
);
const TICKET_CATEGORIES = {
    abus: {
        name: "Gestion abus",
        categoryId: "1515681660866134046",
        staffRoles: [
            "1506678694352261301",
            "1506678765982318743",
            "1506696551706267688"
        ]
    },

    staff: {
        name: "Gestion staff",
        categoryId: "1515681914923515954",
        staffRoles: [
            "1506678694352261301",
            "1506678765982318743",
            "1506696757642530982"
        ]
    },

    partenariat: {
        name: "Équipe partenariats",
        categoryId: "1515682696871936152",
        staffRoles: [
            "1506678694352261301",
            "1506678765982318743",
            "1506702398029172796"
        ]
    },

    casino: {
        name: "Gestion casino",
        categoryId: "1515682782557245450",
        staffRoles: [
            "1506678694352261301",
            "1506678765982318743",
            "1506709088451690708"
        ]
    },

    admin: {
        name: "Support admin",
        categoryId: "1507090226114461879",
        staffRoles: [
            "1506678694352261301",
            "1506678765982318743",
            "1509601528242110525"
        ]
    }
};

module.exports = async (interaction) => {

    // =========================
    // BOUTONS
    // =========================
    if (interaction.isButton()) {

        // AJOUTER
        if (interaction.customId === "customrole_add") {

            const modal = new ModalBuilder()
                .setCustomId("customrole_add_modal")
                .setTitle("Ajouter un rôle personnalisé");

            const roleName = new TextInputBuilder()
                .setCustomId("role_name")
                .setLabel("Nom de la commande")
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

            const roleId = new TextInputBuilder()
                .setCustomId("role_id")
                .setLabel("ID du rôle")
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

            const ownerId = new TextInputBuilder()
                .setCustomId("owner_id")
                .setLabel("ID du propriétaire")
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

            modal.addComponents(
                new ActionRowBuilder().addComponents(roleName),
                new ActionRowBuilder().addComponents(roleId),
                new ActionRowBuilder().addComponents(ownerId)
            );

            return interaction.showModal(modal);
        }

        // SUPPRIMER
        if (interaction.customId === "customrole_remove") {

            const config = JSON.parse(
                fs.readFileSync(configPath, "utf8")
            );

            const roles =
                config.custom_roles || {};

            const commands =
                Object.keys(roles);

            if (!commands.length) {
                return interaction.reply({
                    content:
                        "❌ Aucun rôle personnalisé.",
                    ephemeral: true
                });
            }

            const menu =
                new StringSelectMenuBuilder()
                    .setCustomId(
                        "delete_custom_role"
                    )
                    .setPlaceholder(
                        "Choisir un rôle à supprimer"
                    )
                    .addOptions(
                        commands.map(cmd => ({
                            label: cmd,
                            value: cmd
                        }))
                    );

            return interaction.reply({
                content:
                    "🗑️ Choisissez un rôle :",
                components: [
                    new ActionRowBuilder()
                        .addComponents(menu)
                ],
                ephemeral: true
            });
        }

        // LISTE
        if (
    interaction.customId ===
    "customrole_list"
) {

    const config =
        JSON.parse(
            fs.readFileSync(
                configPath,
                "utf8"
            )
        );

    const roles =
        config.custom_roles || {};

    const commands =
        Object.entries(roles);

    if (!commands.length) {

        return interaction.reply({

            content:
                "❌ Aucun rôle personnalisé.",

            ephemeral: true

        });

    }

    const embed =
        new EmbedBuilder()

        .setTitle(
            "📋 Rôles personnalisés"
        )

        .setColor(
            0x5865F2
        )

        .setTimestamp();

    commands.forEach(
        ([cmd, data]) => {

            embed.addFields({

                name:
                    `+${cmd}`,

                value:
                    `👑 Propriétaire : <@${data.owner_id}>\n🎭 Rôle : <@&${data.role_id}>`,

                inline: false

            });

        }
    );

    return interaction.reply({

        embeds: [embed],

        ephemeral: true

    });

}
        if (interaction.customId === "casinohelp_page2") {

    const embed = new EmbedBuilder()
        .setColor("Gold")
        .setTitle("🎰 Casino Help • Page 2/4")
        .setDescription(`
## Commandes Admins Casino

• /gw
• /greroll
• /addcoins
• /delcoins
• /addgifts
• /delgifts
• /drop
• /renew
• /pingcasino
• /giveboosts
• /giverobs
`);

    const row = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId("casinohelp_page1")
                .setLabel("⬅️")
                .setStyle(ButtonStyle.Secondary),

            new ButtonBuilder()
                .setCustomId("casinohelp_page3")
                .setLabel("➡️")
                .setStyle(ButtonStyle.Primary)
        );

    return interaction.update({
        embeds: [embed],
        components: [row]
    });
}
        if (interaction.customId === "casinohelp_page3") {

    const embed = new EmbedBuilder()
        .setColor("Gold")
        .setTitle("🎰 Casino Help • Page 3/4")
        .setDescription(`
## Commandes Owners Casino

• /gend
• /panelcasino
• /shop
• /resetcasino
• /blacklistcasino
• /blacklist
• /weeklycasino
• /wl
• /wlremove
• /wllist
`);

    const row = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId("casinohelp_page2")
                .setLabel("⬅️")
                .setStyle(ButtonStyle.Secondary),

            new ButtonBuilder()
                .setCustomId("casinohelp_page4")
                .setLabel("➡️")
                .setStyle(ButtonStyle.Primary)
        );

    return interaction.update({
        embeds: [embed],
        components: [row]
    });
}
        if (interaction.customId === "casinohelp_page4") {

    const embed = new EmbedBuilder()
        .setColor("Gold")
        .setTitle("🎰 Casino Help • Page 4/4")
        .setDescription(`
## Commandes GDC Casino

• /clancreate
• /invite
• /leave
• /transfer
• /deleteclan
• /topclans
• /myclan
• /statsclan
`);

    const row = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId("casinohelp_page3")
                .setLabel("⬅️")
                .setStyle(ButtonStyle.Secondary)
        );

    return interaction.update({
        embeds: [embed],
        components: [row]
    });
}
        }
   // =========================
// PANEL CASINO
// =========================
if (
   interaction.isButton() &&
   interaction.customId === "create_profile"
) {
   const roleId = "1507055410211848213";
   const LOGS_CASINO = "1520766436388245585";

   const existing = await CasinoProfile.findOne({
       userId: interaction.user.id
   });

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
}

if (
   interaction.isButton() &&
   interaction.customId === "create_clan"
) {
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

   modal.addComponents(
       new ActionRowBuilder().addComponents(clanName)
   );

   return interaction.showModal(modal);
}
 if (
   interaction.isButton() &&
   interaction.customId.startsWith("gift_open_")
) {
   const CasinoProfile = require("../../models/CasinoProfile");

   const LOGS_CASINO = "1520766436388245585";

   const userId = interaction.customId.replace("gift_open_", "");

   if (interaction.user.id !== userId) {
       return interaction.reply({
           content: "❌ Ce cadeau ne t'appartient pas.",
           ephemeral: true
       });
   }

   const profile = await CasinoProfile.findOne({
       userId: interaction.user.id
   });

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
       { chance: 10, roleId: "1514311105588101332", name: "✨ Perm Animation" },
       { chance: 10, roleId: "1513950039289106502", name: "✏️ Perm Rename" },
       { chance: 15, roleId: "1519383437419610332", name: "💴 50 000 ¥" },
       { chance: 8,  roleId: "1519383482113982474", name: "💴 100 000 ¥" },
       { chance: 4,  roleId: "1519383516658405456", name: "💴 250 000 ¥" },
       { chance: 2,  roleId: "1519383549223108618", name: "💴 500 000 ¥" },
       { chance: 1,  roleId: "1519383582198464593", name: "💴 1 000 000 ¥" }
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

    rewardText =
`${reward.name}

💰 Récompense déjà possédée
➜ Compensation : 5 000 ¥`;

    logAction =
`Récompense déjà possédée — Compensation : 5 000 ¥`;

    // 🔔 Ping des deux rôles à chaque compensation
    await interaction.channel.send({
        content:
`<@&1506709088451690708> <@&1506674274826584284>

⚠️ ${interaction.user} possédait déjà **${reward.name}**.

💰 Une compensation de **5 000 ¥** lui a été accordée.`
    });

} else if (role) {

    await interaction.member.roles.add(role);

    const yensRoles = [

        "1519383437419610332", // 50 000 ¥
        "1519383482113982474", // 100 000 ¥
        "1519383516658405456", // 250 000 ¥
        "1519383549223108618", // 500 000 ¥
        "1519383582198464593"  // 1 000 000 ¥

    ];

    if (yensRoles.includes(role.id)) {

        await interaction.channel.send({
            content:
`<@&1506709088451690708> <@&1506674274826584284>

🎁 ${interaction.user} a obtenu **${reward.name}**.`
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
}
if (
   interaction.isButton() &&
   interaction.customId.startsWith("clan_accept_")
) {
   const LOGS_CLAN = "1520771804610822234";

   const [, , clanId, targetId] = interaction.customId.split("_");

   if (interaction.user.id !== targetId) {
       return interaction.reply({
           content: "❌ Cette invitation ne t'est pas destinée.",
           ephemeral: true
       });
   }

   const clan = await Clan.findById(clanId);

   if (!clan) {
       return interaction.reply({
           content: "❌ Clan introuvable.",
           ephemeral: true
       });
   }

   const alreadyClan = await Clan.findOne({ members: interaction.user.id });

   if (alreadyClan) {
       return interaction.reply({
           content: "❌ Tu es déjà dans un clan.",
           ephemeral: true
       });
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
}

if (
   interaction.isButton() &&
   interaction.customId.startsWith("clan_decline_")
) {
   const LOGS_CLAN = "1520771804610822234";

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
}

if (
   interaction.isButton() &&
   interaction.customId.startsWith("deleteclan_confirm_")
) {
   const LOGS_CLAN = "1520771804610822234";

   const clanId = interaction.customId.replace("deleteclan_confirm_", "");
   const clan = await Clan.findById(clanId);

   if (!clan) {
       return interaction.reply({
           content: "❌ Clan introuvable.",
           ephemeral: true
       });
   }

   if (clan.ownerId !== interaction.user.id) {
       return interaction.reply({
           content: "❌ Tu n'es pas le chef de ce clan.",
           ephemeral: true
       });
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
}

if (
   interaction.isButton() &&
   interaction.customId.startsWith("deleteclan_cancel_")
) {
   return interaction.update({
       content: "❌ Suppression annulée.",
       embeds: [],
       components: []
   });
}
// =========================
// SHOP
// =========================
if (
    interaction.isButton() &&
    interaction.customId.startsWith("shop_buy_")
) {
    const { SHOP_ITEMS } = require("../slashCommands/shop");
    const LOGS_CASINO = "1520766436388245585";

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
}
    // =========================
// BOUNTY
// =========================
if (
    interaction.isButton() &&
    interaction.customId.startsWith("bounty_claim_")
) {
    const parts = interaction.customId.split("_");
    // bounty_claim_<targetId>_<posterId>_<amount>
    const targetId = parts[2];
    const posterId = parts[3];
    const amount = parseInt(parts[4]);

    // ✅ La cible ne peut pas réclamer sa propre prime
    if (interaction.user.id === targetId) {
        return interaction.reply({
            content: "❌ Tu ne peux pas réclamer ta propre prime.",
            ephemeral: true
        });
    }

    // ✅ Le poseur ne peut pas réclamer non plus
    if (interaction.user.id === posterId) {
        return interaction.reply({
            content: "❌ Tu ne peux pas réclamer une prime que tu as posée.",
            ephemeral: true
        });
    }

    // ✅ Vérification clan
    const clan = await Clan.findOne({ members: interaction.user.id });
    if (!clan) {
        return interaction.reply({
            content: "❌ Tu dois être dans un clan pour réclamer une prime.",
            ephemeral: true
        });
    }

    // ✅ Attribution des yens
    const profile = await CasinoProfile.findOneAndUpdate(
        { userId: interaction.user.id },
        { $setOnInsert: { userId: interaction.user.id } },
        { upsert: true, new: true }
    );

    profile.yens += amount;
    await profile.save();

    // ✅ Mise à jour de l'embed
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

    // ✅ Logs
    try {
        const LOGS_CASINO = "1520766436388245585";
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
}

// =========================
// GIVEAWAYS
// =========================

const Giveaway = require("../../models/Giveaway");

if (interaction.isButton()) {

    if (interaction.customId.startsWith("gw_")) {

        const giveawayId =
            interaction.customId.replace("gw_", "");

        const giveaway =
            await Giveaway.findById(giveawayId);

        if (!giveaway) {
            return interaction.reply({
                content: "❌ Giveaway introuvable.",
                ephemeral: true
            });
        }

        if (giveaway.ended) {
            return interaction.reply({
                content: "❌ Ce giveaway est terminé.",
                ephemeral: true
            });
        }

        if (giveaway.participants.includes(interaction.user.id)) {
            giveaway.participants =
                giveaway.participants.filter(
                    id => id !== interaction.user.id
                );
        } else {
            giveaway.participants.push(
                interaction.user.id
            );
        }

        await giveaway.save();

        const msg =
            await interaction.channel.messages.fetch(
                giveaway.messageId
            );

        const embed =
            EmbedBuilder.from(
                msg.embeds[0]
            );

        const emoji =
            giveaway.type === "casino"
                ? "<:casino:1507449727266979922>"
                : "<:nitro:1508097922489647234>";

        embed.setDescription(
`# Giveaway: ${giveaway.prize}

Cliquez sur le bouton ${emoji} pour participer
*Nombre de gagnants:* ${giveaway.winnersCount}

## Fin du giveaway
<t:${Math.floor(giveaway.endAt / 1000)}:R>`
        );

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`gw_${giveaway._id}`)
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji(
                        giveaway.type === "casino"
                            ? "1507449727266979922"
                            : "1508097922489647234"
                    )
                    .setLabel(
                        String(giveaway.participants.length)
                    )
            );

        await msg.edit({
            embeds: [embed],
            components: [row]
        });

        return interaction.reply({
            content:
                giveaway.participants.includes(
                    interaction.user.id
                )
                    ? "✅ Participation enregistrée."
                    : "❌ Participation retirée.",
            ephemeral: true
        });
    }
}
    // =========================
    // MODAL
    // =========================
    if (interaction.isModalSubmit()) {
        const Clan =
require("../../models/Clan");

const CasinoProfile =
require("../../models/CasinoProfile");

if (
    interaction.customId ===
    "create_clan_modal"
) {

    const clanName =
        interaction.fields.getTextInputValue(
            "clan_name"
        );

    const profile =
        await CasinoProfile.findOne({
            userId:
            interaction.user.id
        });

    if (
        !profile ||
        profile.yens < 10000
    ) {

        return interaction.reply({
            content:
            "❌ Il faut 10 000 ¥ pour créer un clan.",
            ephemeral: true
        });

    }

    const alreadyClan =
        await Clan.findOne({
            members:
            interaction.user.id
        });

    if (alreadyClan) {

        return interaction.reply({
            content:
            "❌ Tu possèdes déjà un clan.",
            ephemeral: true
        });

    }

    profile.yens -= 10000;
    await profile.save();

    const categoryId =
    "1519061386192224376";

const channel =
    await interaction.guild.channels.create({
        name: `🏰・${clanName}`,
        type: 0, // salon texte
        parent: categoryId,
        permissionOverwrites: [
            {
                id: interaction.guild.id,
                deny: ["ViewChannel"]
            },
            {
                id: interaction.user.id,
                allow: [
                    "ViewChannel",
                    "SendMessages",
                    "ReadMessageHistory"
                ]
            }
        ]
    });

const clan =
    await Clan.create({
        name: clanName,
        ownerId: interaction.user.id,
        members: [interaction.user.id],
        channelId: channel.id
    });

console.log(
    "Clan créé :",
    clan
);

await channel.send({
    content:
        `👑 Bienvenue <@${interaction.user.id}> dans le clan **${clanName}** !`
});

return interaction.reply({
    content:
        `✅ Clan **${clanName}** créé avec succès.\n📍 Salon : ${channel}`,
    ephemeral: true
});
    }
if (
            interaction.customId ===
            "customrole_add_modal"
        ) {

            const commandName =
                interaction.fields.getTextInputValue(
                    "role_name"
                );

            const roleId =
                interaction.fields.getTextInputValue(
                    "role_id"
                );

            const ownerId =
                interaction.fields.getTextInputValue(
                    "owner_id"
                );

            const config = JSON.parse(
                fs.readFileSync(configPath, "utf8")
            );

            if (!config.custom_roles)
                config.custom_roles = {};

            config.custom_roles[
                commandName.toLowerCase()
            ] = {
                role_id: roleId,
                owner_id: ownerId
            };

            fs.writeFileSync(
                configPath,
                JSON.stringify(
                    config,
                    null,
                    2
                )
            );

            return interaction.reply({
                content:
                    `✅ Rôle personnalisé créé\n\n` +
                    `Commande : +${commandName}\n` +
                    `Rôle : ${roleId}\n` +
                    `Propriétaire : ${ownerId}`,
                ephemeral: true
            });
        }
    }
// =========================
// CREATION DES TICKETS
// =========================
if (
    interaction.isStringSelectMenu() &&
    interaction.customId === "ticket_category"
) {
    const type = interaction.values[0];
    const category = TICKET_CATEGORIES[type];

    if (!category) {
        return interaction.reply({
            content: "❌ Catégorie invalide.",
            ephemeral: true
        });
    }

    const already = interaction.guild.channels.cache.find(c =>
        c.topic === interaction.user.id &&
        c.parentId === category.categoryId
    );

    if (already) {
        return interaction.reply({
            content: `❌ Tu possèdes déjà un ticket : ${already}`,
            ephemeral: true
        });
    }

    const permissions = [
        {
            id: interaction.guild.id,
            deny: [PermissionsBitField.Flags.ViewChannel]
        },
        {
            id: interaction.user.id,
            allow: [
                PermissionsBitField.Flags.ViewChannel,
                PermissionsBitField.Flags.SendMessages,
                PermissionsBitField.Flags.ReadMessageHistory
            ]
        }
    ];

    for (const role of category.staffRoles) {
        permissions.push({
            id: role,
            allow: [
                PermissionsBitField.Flags.ViewChannel,
                PermissionsBitField.Flags.SendMessages,
                PermissionsBitField.Flags.ReadMessageHistory
            ]
        });
    }

    const channel = await interaction.guild.channels.create({
        name: `ticket-${interaction.user.username}`,
        type: ChannelType.GuildText,
        parent: category.categoryId,
        topic: interaction.user.id,
        permissionOverwrites: permissions
    });

    const embed = new EmbedBuilder()
        .setColor("Blue")
        .setTitle("🎫 Ticket créé")
        .setDescription(
            `Bienvenue ${interaction.user}.\n\nUn membre du staff prendra en charge votre demande.\n\n**Catégorie :** ${category.name}`
        );

    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId("ticket_claim")
            .setLabel("📌 Claim")
            .setStyle(ButtonStyle.Primary),

        new ButtonBuilder()
            .setCustomId("ticket_close")
            .setLabel("🔒 Fermer")
            .setStyle(ButtonStyle.Danger)
    );

    // Mention des rôles staff de la catégorie
    const staffMentions = category.staffRoles.map(id => `<@&${id}>`).join(" ");

    await channel.send({
        content: `${interaction.user} ${staffMentions}`,
        embeds: [embed],
        components: [row]
    });

    return interaction.reply({
        content: `✅ Ton ticket a été créé : ${channel}`,
        ephemeral: true
    });
}
// =========================
// REVENDIQUER LE TICKET
// =========================
if (
    interaction.isButton() &&
    interaction.customId === "ticket_claim"
) {

    const claimButton = interaction.message.components[0].components.find(
        b => b.data.custom_id === "ticket_claim"
    );

    if (claimButton?.data?.disabled) {
        return interaction.reply({
            content: "❌ Ce ticket est déjà pris en charge.",
            ephemeral: true
        });
    }

    // On récupère l'embed actuel
    const embed = EmbedBuilder.from(interaction.message.embeds[0]);

    embed.addFields({
        name: "📌 Pris en charge par",
        value: `${interaction.user}`,
        inline: false
    });

    // Nouveau bouton Claim
    const row = new ActionRowBuilder().addComponents(

        new ButtonBuilder()
            .setCustomId("ticket_claim")
            .setLabel(`📌 ${interaction.user.username}`)
            .setStyle(ButtonStyle.Success)
            .setDisabled(true),

        new ButtonBuilder()
            .setCustomId("ticket_add")
            .setLabel("➕ Ajouter")
            .setStyle(ButtonStyle.Primary),

        new ButtonBuilder()
            .setCustomId("ticket_remove")
            .setLabel("➖ Retirer")
            .setStyle(ButtonStyle.Secondary),

        new ButtonBuilder()
            .setCustomId("ticket_close")
            .setLabel("🔒 Fermer")
            .setStyle(ButtonStyle.Danger)
    );

    await interaction.update({
        embeds: [embed],
        components: [row]
    });

    await interaction.channel.permissionOverwrites.edit(interaction.user.id, {
        ViewChannel: true,
        SendMessages: true
    });

    await interaction.channel.send({
        content: `📌 ${interaction.user} prend désormais ce ticket en charge.`
    });

    return;
}
    if (
    interaction.isButton() &&
    interaction.customId === "ticket_add"
) {
    await interaction.reply({
        content: "Mentionne le membre à ajouter au ticket.",
        ephemeral: true
    });

    const filter = m => m.author.id === interaction.user.id;

    const collected = await interaction.channel.awaitMessages({
        filter,
        max: 1,
        time: 30000
    }).catch(() => null);

    if (!collected || !collected.first()) return;

    const member = collected.first().mentions.members.first();

    if (!member)
        return interaction.followUp({
            content: "❌ Aucun membre mentionné.",
            ephemeral: true
        });

    await interaction.channel.permissionOverwrites.edit(member.id, {
        ViewChannel: true,
        SendMessages: true,
        ReadMessageHistory: true
    });

    collected.first().delete().catch(() => {});

    interaction.followUp({
        content: `✅ ${member} a été ajouté au ticket.`,
        ephemeral: false
    });
}
if (
    interaction.isButton() &&
    interaction.customId === "ticket_remove"
) {
    await interaction.reply({
        content: "Mentionne le membre à retirer du ticket.",
        ephemeral: true
    });

    const filter = m => m.author.id === interaction.user.id;

    const collected = await interaction.channel.awaitMessages({
        filter,
        max: 1,
        time: 30000
    }).catch(() => null);

    if (!collected || !collected.first()) return;

    const member = collected.first().mentions.members.first();

    if (!member)
        return interaction.followUp({
            content: "❌ Aucun membre mentionné.",
            ephemeral: true
        });

    await interaction.channel.permissionOverwrites.delete(member.id);

    collected.first().delete().catch(() => {});

    interaction.followUp({
        content: `✅ ${member} a été retiré du ticket.`,
        ephemeral: false
    });
}
// =========================
// FERMER LE TICKET
// =========================
if (
    interaction.isButton() &&
    interaction.customId === "ticket_close"
) {
const LOG_CHANNEL_ID = "1517116985077665872";

    const embed = new EmbedBuilder()
        .setColor("Orange")
        .setTitle("🔒 Ticket fermé")
        .setDescription("Ce ticket est fermé.\nSeul un modérateur peut désormais le supprimer.");

    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId("ticket_delete")
            .setLabel("🗑️ Supprimer")
            .setStyle(ButtonStyle.Danger)
    );

    await interaction.channel.send({
        embeds: [embed],
        components: [row]
    });

    await interaction.channel.permissionOverwrites.edit(
        interaction.channel.topic,
        {
            SendMessages: false
        }
    );
const logChannel = interaction.guild.channels.cache.get(LOG_CHANNEL_ID);

if (logChannel) {
    const logEmbed = new EmbedBuilder()
        .setColor("Red")
        .setTitle("📁 Ticket fermé")
        .addFields(
            {
                name: "🎫 Ticket",
                value: interaction.channel.name,
                inline: true
            },
            {
                name: "👤 Fermé par",
                value: `${interaction.user}`,
                inline: true
            }
        )
        .setTimestamp();

    await logChannel.send({
        embeds: [logEmbed]
    });
}
    return interaction.reply({
        content: "🔒 Ticket fermé.",
        ephemeral: true
    });
}
// =========================
// SUPPRIMER LE TICKET
// =========================
if (
    interaction.isButton() &&
    interaction.customId === "ticket_delete"
) {

    const staffRoles = [
        "1506678694352261301",
        "1506678765982318743",
        "1506696551706267688",
        "1506696757642530982",
        "1506702398029172796",
        "1506709088451690708",
        "1509601528242110525"
    ];

    const isStaff = interaction.member.roles.cache.some(role =>
        staffRoles.includes(role.id)
    );

    if (!isStaff) {
        return interaction.reply({
            content: "❌ Seul un membre du staff peut supprimer ce ticket.",
            ephemeral: true
        });
    }

    // Création du transcript HTML
    const attachment = await discordTranscripts.createTranscript(interaction.channel, {
        filename: `${interaction.channel.name}.html`
    });

    const logChannel = interaction.guild.channels.cache.get("1517116985077665872");

    if (logChannel) {
        await logChannel.send({
            content: `📄 Transcript de ${interaction.channel.name}`,
            files: [attachment]
        });
    }

    await interaction.reply({
        content: "🗑️ Suppression du ticket dans 5 secondes...",
        ephemeral: true
    });

    setTimeout(async () => {
        await interaction.channel.delete().catch(() => {});
    }, 5000);

    return;
}

    // =========================
    // MENU DE SUPPRESSION
    // =========================
    if (interaction.isStringSelectMenu()) {

        if (
            interaction.customId ===
            "delete_custom_role"
        ) {

            const command =
                interaction.values[0];

            const config = JSON.parse(
                fs.readFileSync(configPath, "utf8")
            );

            delete config.custom_roles[
                command
            ];

            fs.writeFileSync(
                configPath,
                JSON.stringify(
                    config,
                    null,
                    2
                )
            );

            return interaction.update({
                content:
                    `✅ ${command} supprimé.`,
                components: []
            });
        }
    }
};
