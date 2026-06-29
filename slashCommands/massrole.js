const {
    SlashCommandBuilder
} = require("discord.js");
module.exports = {
    data: new SlashCommandBuilder()
        .setName("massrole")
        .setDescription("Ajoute un rôle en masse")
        .addRoleOption(option =>
            option
                .setName("role")
                .setDescription("Rôle à ajouter")
                .setRequired(true)
        )
        .addRoleOption(option =>
            option
                .setName("filtre")
                .setDescription("Ajouter uniquement aux membres possédant ce rôle")
                .setRequired(false)
        ),
    async execute(interaction) {
        if (interaction.user.id !== "1418370654251778168") {
            return interaction.reply({
                content: "❌ Vous ne pouvez pas utiliser cette commande.",
                ephemeral: true
            });
        }
        const role =
            interaction.options.getRole("role");
        const filterRole =
            interaction.options.getRole("filtre");
        if (
            role.position >=
            interaction.guild.members.me.roles.highest.position
        ) {
            return interaction.reply({
                content: "❌ Mon rôle est trop bas pour attribuer ce rôle.",
                ephemeral: true
            });
        }
        await interaction.reply(
            "⏳ Début du massrole..."
        );
        const members =
            [...interaction.guild.members.cache.values()];
        let done = 0;
        let added = 0;
        let failed = 0;
        for (const member of members) {
            done++;
            if (!member) continue;
            if (member.user.bot) continue;
            if (!member.manageable) continue;
            if (
                filterRole &&
                !member.roles.cache.has(filterRole.id)
            ) continue;
            if (
                member.roles.cache.has(role.id)
            ) continue;
            try {
                await member.roles.add(role);
                added++;
            } catch {
                failed++;
            }
            if (done % 10 === 0) {
                await interaction.editReply(
`⏳ Progression...
👥 ${done}/${members.length}
✅ Ajoutés : ${added}
❌ Échecs : ${failed}`
                ).catch(() => {});
                await new Promise(resolve =>
                    setTimeout(resolve, 1000)
                );
            }
        }
        await interaction.editReply(
`✅ Massrole terminé !
🎭 Rôle : ${role.name}
👥 Membres parcourus : ${members.length}
✅ Ajoutés : ${added}
❌ Échecs : ${failed}`
        );
    }
};
