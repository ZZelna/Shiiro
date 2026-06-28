const {
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    ActionRowBuilder,
    StringSelectMenuBuilder,
    EmbedBuilder,
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");

const fs = require("fs");
const path = require("path");
const CasinoProfile =
    require("../../models/CasinoProfile");
const Clan =
require("../../models/Clan");
const configPath = path.join(
    __dirname,
    "../../config.json"
);

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
       rewardText = `${reward.name}\n\n💰 Récompense déjà possédée\n➜ Compensation : 5 000 ¥`;
       logAction = `Récompense déjà possédée — Compensation: 5 000 ¥`;
   } else if (role) {
       await interaction.member.roles.add(role);
       logAction = `Rôle attribué.`;
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
