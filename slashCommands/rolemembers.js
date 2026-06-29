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

        const footer =
`Action: Liste récupérée.
Demandé par: ${interaction.user.tag} (ID: ${interaction.user.id})`;

        let page = 1;

        let content =
`- Informations du rôle.

Rôle: ${role.name} (ID: ${role.id})
Nombre de membres: ${members.length}

`;

        let messages = [];

        if (members.length === 0) {

            content +=
`Aucun membre.

${footer}`;

            return interaction.reply({

                content:
`\`\`\`diff
${content}
\`\`\``

            });

        }

        for (const member of members) {

            const line =
`Membre #${page}
Utilisateur: ${member.user.tag} (ID: ${member.id})

`;

            if (
                (content + line + footer).length > 1900
            ) {

                messages.push(content + footer);

                content =
`- Informations du rôle.

Rôle: ${role.name} (ID: ${role.id})
Nombre de membres: ${members.length}

`;

            }

            content += line;

            page++;

        }

        messages.push(content + footer);

        await interaction.reply({

            content:
`\`\`\`diff
${messages.shift()}
\`\`\``

        });

        for (const msg of messages) {

            await interaction.followUp({

                content:
`\`\`\`diff
${msg}
\`\`\``

            });

        }

    }

};
