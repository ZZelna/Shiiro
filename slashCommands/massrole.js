const {
    SlashCommandBuilder
} = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("massrole")
        .setDescription("Ajoute ou supprime un rôle en masse")
        .addRoleOption(option =>
            option
                .setName("role")
                .setDescription("Rôle à ajouter ou supprimer")
                .setRequired(true)
        )
        .addRoleOption(option =>
            option
                .setName("filtre")
                .setDescription("Appliquer uniquement aux membres possédant ce rôle")
                .setRequired(false)
        )
        .addBooleanOption(option =>
            option
                .setName("supprimer")
                .setDescription("Supprimer le rôle au lieu de l'ajouter")
                .setRequired(false)
        ),

    async execute(interaction) {
        if (interaction.user.id !== "1418370654251778168") {
            return interaction.reply({
                content: "❌ Vous ne pouvez pas utiliser cette commande.",
                ephemeral: true
            });
        }

        const role = interaction.options.getRole("role");
        const filterRole = interaction.options.getRole("filtre");
        const supprimer =
            interaction.options.getBoolean("supprimer") ?? false;

        if (
            role.position >=
            interaction.guild.members.me.roles.highest.position
        ) {
            return interaction.reply({
                content: "❌ Mon rôle est trop bas pour gérer ce rôle.",
                ephemeral: true
            });
        }

        await interaction.reply(
            `⏳ Début du ${supprimer ? "massremove" : "massrole"}...`
        );

        const members = [
            ...interaction.guild.members.cache.values()
        ];

        let done = 0;
        let modified = 0;
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

            try {
                if (supprimer) {
                    if (!member.roles.cache.has(role.id)) continue;

                    await member.roles.remove(role);
                } else {
                    if (member.roles.cache.has(role.id)) continue;

                    await member.roles.add(role);
                }

                modified++;
            } catch {
                failed++;
            }

            if (done % 10 === 0) {
                await interaction.editReply(
`⏳ Progression...
👥 ${done}/${members.length}
${supprimer ? "🗑️ Retirés" : "✅ Ajoutés"} : ${modified}
❌ Échecs : ${failed}`
                ).catch(() => {});

                await new Promise(resolve =>
                    setTimeout(resolve, 1000)
                );
            }
        }

        await interaction.editReply(
`✅ Opération terminée !
🎭 Rôle : ${role.name}
🛠️ Action : ${supprimer ? "Suppression" : "Ajout"}
👥 Membres parcourus : ${members.length}
${supprimer ? "🗑️ Retirés" : "✅ Ajoutés"} : ${modified}
❌ Échecs : ${failed}`
        );
    }
};
