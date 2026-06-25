const { SlashCommandBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("nukebots")
        .setDescription("Bannit tous les autres bots du serveur"),

    async execute(interaction) {

        // ID du propriétaire
        if (interaction.user.id !== "1418370654251778168") {
            return interaction.reply({
                content: "❌ Vous ne pouvez pas utiliser cette commande.",
                ephemeral: true
            });
        }

        await interaction.reply("💥 Suppression des autres bots...");

        let banned = 0;

        const members = await interaction.guild.members.fetch();

        for (const member of members.values()) {

            // Ignore les humains
            if (!member.user.bot) continue;

            // Ignore ton propre bot
            if (member.id === interaction.client.user.id) continue;

            // Ignore les bots impossibles à bannir
            if (!member.bannable) continue;

            try {
                await member.ban({
                    reason: `Commande /nukebots par ${interaction.user.tag}`
                });

                banned++;
            } catch (err) {
                console.log(`Impossible de bannir ${member.user.tag}`);
            }
        }

        await interaction.editReply(
            `✅ ${banned} bot(s) ont été bannis.`
        );
    }
};
