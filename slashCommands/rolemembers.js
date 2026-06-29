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

const lines =
    members.length === 0
        ? ["Aucun membre."]
        : members.map(member =>
            `${member.user.tag} (ID: ${member.id})`
        );

const header =
`- Informations du rôle.
Rôle: ${role.name} (ID: ${role.id})
Nombre de membres: ${members.length}

Membres:
`;

const footer =
`\nAction: Liste des membres récupérée.
Demandé par: ${interaction.user.tag} (ID: ${interaction.user.id})`;

let messages = [];
let current = header;

for (const line of lines) {

    if ((current + line + "\n" + footer).length > 1980) {

        messages.push(current + footer);
        current = header;

    }

    current += line + "\n";

}

messages.push(current + footer);

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
