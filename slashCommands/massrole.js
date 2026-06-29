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

        await interaction.reply(
            "⏳ Chargement des membres..."
        );

        await interaction.guild.members.fetch();

        const members =
    interaction.guild.members.cache;

        let done = 0;
        let added = 0;

        for (const member of members) {

            done++;

            if (member.user.bot)
                continue;

            if (
                filterRole &&
                !member.roles.cache.has(filterRole.id)
            )
                continue;

            if (
                member.roles.cache.has(role.id)
            )
                continue;

            if (
                role.position >=
                interaction.guild.members.me.roles.highest.position
            )
                continue;

            try {

                await member.roles.add(role);

                added++;

            } catch {}

            if (done % 25 === 0) {

                await interaction.editReply(
                    `⏳ Progression...\n${done}/${members.length}\n✅ Ajoutés : ${added}`
                ).catch(() => {});

            }

        }

        await interaction.editReply(
            `✅ Terminé !\n\n👥 Membres parcourus : ${members.length}\n🎭 Rôle ajouté à : ${added}`
        );

    }

};
