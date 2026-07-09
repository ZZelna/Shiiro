const {
    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ComponentType
} = require("discord.js");

const OWNER_ID = "1418370654251778168";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("uhq")
        .setDescription("Affiche tous les serveurs où le bot est présent."),

    async execute(interaction) {

        if (interaction.user.id !== OWNER_ID) {
            return interaction.reply({
                content: "❌ Vous n'avez pas la permission d'utiliser cette commande.",
                ephemeral: true
            });
        }

        const guilds = [...interaction.client.guilds.cache.values()];

        const pageSize = 10;
        let page = 0;

        const createEmbed = () => {

            const start = page * pageSize;
            const end = start + pageSize;

            const current = guilds.slice(start, end);

            const embed = new EmbedBuilder()
                .setColor("#5865F2")
                .setTitle("🌐 Serveurs de Shiiro")
                .setFooter({
                    text: `Page ${page + 1}/${Math.ceil(guilds.length / pageSize)} • ${guilds.length} serveurs`
                });

        current.forEach((guild, index) => {

    embed.addFields({
        name: `🌐 ${guild.name}`,
        value:
`🆔 **ID :** ${guild.id}
👥 **Membres :** ${guild.memberCount}
🤖 **Bots :** ${guild.members.cache.filter(m => m.user.bot).size}

────────────────────────────────────`,
        inline: false
    });

});

            return embed;

        };

        const buttons = () =>
            new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId("prev")
                    .setLabel("◀️")
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(page === 0),

                new ButtonBuilder()
                    .setCustomId("next")
                    .setLabel("▶️")
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(page >= Math.ceil(guilds.length / pageSize) - 1)
            );

        const msg = await interaction.reply({
            embeds: [createEmbed()],
            components: [buttons()],
            fetchReply: true,
            ephemeral: true
        });

        const collector = msg.createMessageComponentCollector({
            componentType: ComponentType.Button,
            time: 300000
        });

        collector.on("collect", async i => {

            if (i.user.id !== interaction.user.id) {
                return i.reply({
                    content: "❌ Cette interaction ne vous appartient pas.",
                    ephemeral: true
                });
            }

            if (i.customId === "prev") page--;
            if (i.customId === "next") page++;

            await i.update({
                embeds: [createEmbed()],
                components: [buttons()]
            });

        });

        collector.on("end", async () => {

            try {

                await msg.edit({
                    components: []
                });

            } catch {}

        });

    }
};
