const {
    SlashCommandBuilder
} = require("discord.js");

module.exports = {

    data: new SlashCommandBuilder()

        .setName("rolemembers")

        .setDescription("Affiche tous les membres possédant un rôle.")

        .addRoleOption(option =>
            option
                .setName("role")
                .setDescription("Le rôle à vérifier")
                .setRequired(true)
        ),

    async execute(interaction) {

        const role =
            interaction.options.getRole("role");

        const members =
            [...role.members.values()];

        const list =
            members.length === 0
                ? "Aucun membre."
                : members
                    .map(member =>
                        `${member.user.username} (ID: ${member.id})`
                    )
                    .join("\n");

        await interaction.reply({

            content:
`- Informations du rôle.
Rôle: ${role.name} (ID: ${role.id})
Nombre de membres: ${members.length}

Membres:
${list}

Action: Liste des membres récupérée.
Demandé par: ${interaction.user.tag} (ID: ${interaction.user.id})`

        });

    }

};
