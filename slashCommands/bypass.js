const fs = require("fs");
const path = require("path");
const {
SlashCommandBuilder,
EmbedBuilder
} = require("discord.js");

const bypassData = require("../data/bypass.json");

const allowedRoles = [
"1506674274826584284",
"1507082580414173234"
];

module.exports = {
data: new SlashCommandBuilder()
.setName("bypass")
.setDescription("Ajoute un utilisateur à la liste bypass")
.addStringOption(option =>
    option
        .setName("id")
        .setDescription("ID utilisateur à ajouter au bypass")
        .setRequired(true)
)
async execute(interaction) {

    const hasPermission =
        interaction.member.roles.cache.some(role =>
            allowedRoles.includes(role.id)
        );

    if (!hasPermission) {
        return interaction.reply({
            content: "❌ Vous n'avez pas la permission d'utiliser cette commande.",
            ephemeral: true
        });
    }

    const userId =
    interaction.options.getString("id");

    if (!member) {
        return interaction.reply({
            content: "❌ Utilisateur introuvable.",
            ephemeral: true
        });
    }

    if (!bypassData.users) {
        bypassData.users = [];
    }

    if (!bypassData.users.includes(member.id)) {

        bypassData.users.push(member.id);

        fs.writeFileSync(
            path.join(
                __dirname,
                "../data/bypass.json"
            ),
            JSON.stringify(
                bypassData,
                null,
                4
            )
        );
    }

    const embed = new EmbedBuilder()
        .setColor("Green")
        .setTitle("✅ By-pass ajouté")
       .setDescription(
    `L'ID \`${userId}\` a été ajouté à la liste bypass.`
)
        .addFields({
            name: "👮 Responsable",
            value: interaction.user.tag
        })
        .setTimestamp();

    await interaction.reply({
        embeds: [embed]
    });
}
  };
