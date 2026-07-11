const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

module.exports = async function handleCasinoHelpInteraction(interaction) {

    if (!interaction.isButton()) return;

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

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId("casinohelp_page1").setLabel("⬅️").setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId("casinohelp_page3").setLabel("➡️").setStyle(ButtonStyle.Primary)
        );

        return interaction.update({ embeds: [embed], components: [row] });
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

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId("casinohelp_page2").setLabel("⬅️").setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId("casinohelp_page4").setLabel("➡️").setStyle(ButtonStyle.Primary)
        );

        return interaction.update({ embeds: [embed], components: [row] });
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

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId("casinohelp_page3").setLabel("⬅️").setStyle(ButtonStyle.Secondary)
        );

        return interaction.update({ embeds: [embed], components: [row] });
    }
};
