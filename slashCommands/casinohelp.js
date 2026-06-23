const {
    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("casinohelp")
        .setDescription("Affiche l'aide du casino"),

    async execute(interaction) {

        const pages = [

            new EmbedBuilder()
                .setColor("Gold")
                .setTitle("🎰 Casino Help (1/4)")
                .setDescription(`
# Commandes globales casino 🎰

• \`+casino\`
• \`+daily\`
• \`+claim\`
• \`+gift\`
• \`+rob\`
• \`+pileface pile montant\`
• \`+pileface face montant\`
• \`+blackjack\`
• \`+timers\`
• \`+luck\`
                `),

            new EmbedBuilder()
                .setColor("Gold")
                .setTitle("🎰 Casino Help (2/4)")
                .setDescription(`
# Commandes globales casino 🎰

• \`+topcoins\`
• \`+attack\`
• \`+donate\`
• \`+bountystatus\`
• \`+bounty\`
• \`+bountylist\`

# Commandes admins casino 🎰

• \`+gw\`
• \`+greroll\`
• \`+addcoins\`
• \`+delcoins\`
                `),

            new EmbedBuilder()
                .setColor("Gold")
                .setTitle("🎰 Casino Help (3/4)")
                .setDescription(`
# Commandes admins casino 🎰

• \`+addgifts\`
• \`+delgifts\`
• \`+drop\`
• \`+renew\`
• \`+pingcasino\`
• \`+giveboosts\`
• \`+giverobs\`

# Owners casino 🎰

• \`+gend\`
• \`+panelcasino\`
• \`+shop\`
• \`+resetcasino\`
                `),

            new EmbedBuilder()
                .setColor("Gold")
                .setTitle("🎰 Casino Help (4/4)")
                .setDescription(`
# Owners casino 🎰

• \`+blacklistcasino\`
• \`+blacklist\`
• \`+weeklycasino\`
• \`+wl\`
• \`+wlremove\`
• \`+wllist\`

# Commandes GDC casino 🎰

• \`+clancreate\`
• \`+invite\`
• \`+leave\`
• \`+transfer\`
• \`+deleteclan\`
• \`+topclans\`
• \`+myclan\`
• \`+statsclan\`
                `)
        ];

        let page = 0;

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId("prev")
                    .setLabel("⬅️")
                    .setStyle(ButtonStyle.Secondary),

                new ButtonBuilder()
                    .setCustomId("next")
                    .setLabel("➡️")
                    .setStyle(ButtonStyle.Secondary)
            );

        const msg = await interaction.reply({
            embeds: [pages[0]],
            components: [row],
            fetchReply: true
        });

        const collector = msg.createMessageComponentCollector({
            time: 300000
        });

        collector.on("collect", async i => {

            if (i.user.id !== interaction.user.id) {
                return i.reply({
                    content: "❌ Vous ne pouvez pas utiliser ce menu.",
                    ephemeral: true
                });
            }

            if (i.customId === "next") {
                page++;
                if (page >= pages.length) page = 0;
            }

            if (i.customId === "prev") {
                page--;
                if (page < 0) page = pages.length - 1;
            }

            await i.update({
                embeds: [pages[page]]
            });
        });

        collector.on("end", async () => {
            await msg.edit({
                components: []
            }).catch(() => {});
        });
    }
};
