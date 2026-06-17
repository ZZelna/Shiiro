const {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");

module.exports = {
    name: "casinohelp",

    async run(message) {

        const embed = new EmbedBuilder()
            .setColor("Gold")
            .setTitle("🎰 Casino Help • Page 1/4")
            .setDescription(`
## Commandes globales

• +casino
• +daily
• +claim
• +gift
• +rob
• +pileface pile montant
• +pileface face montant
• +blackjack
• +timers
• +luck
• +topcoins
• +attack
• +donate
• +bountystatus
• +bounty
• +bountylist
`);

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId("casinohelp_page2")
                    .setLabel("➡️")
                    .setStyle(ButtonStyle.Primary)
            );

        await message.reply({
            embeds: [embed],
            components: [row]
        });
    }
};
