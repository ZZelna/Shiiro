const {
    SlashCommandBuilder
} = require("discord.js");

const GlobalBlacklist =
require("../models/GlobalBlacklist");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("unbl")
        .setDescription(
            "Retirer un utilisateur de la blacklist globale"
        )
        .addStringOption(option =>
    option
        .setName("id")
        .setDescription(
            "ID de l'utilisateur"
        )
        .setRequired(true)
),

    async execute(interaction) {

        const allowedRole =
        "1506674274826584284";

        if (
            !interaction.member.roles.cache.has(
                allowedRole
            )
        ) {

            return interaction.reply({
                content:
                "❌ Tu n'as pas la permission d'utiliser cette commande.",
                ephemeral: true
            });

        }

        const targetId =
interaction.options.getString(
    "id"
);

const target =
await interaction.client.users
    .fetch(targetId)
    .catch(() => null);

if (!target) {

    return interaction.reply({
        content:
        "❌ Utilisateur introuvable.",
        ephemeral: true
    });

}
        const blacklisted =
        await GlobalBlacklist.findOne({
            userId: target.id
        });

        if (!blacklisted) {

            return interaction.reply({
                content:
                "❌ Cet utilisateur n'est pas blacklisté globalement.",
                ephemeral: true
            });

        }

        await GlobalBlacklist.deleteOne({
            userId: target.id
        });
const logChannel =
interaction.client.channels.cache.get(
    "1519342181893148784"
);

if (logChannel) {

    await logChannel.send({
        content:
`\`\`\`diff
- Blacklist Globale retirée.
Utilisateur: ${target.tag} (ID: ${target.id})
Modérateur: ${interaction.user.tag} (ID: ${interaction.user.id})
Action: Utilisateur retiré de la blacklist. ✅
\`\`\``
    });

}
        return interaction.reply({
            content:
`\`\`\`diff
- Blacklist Globale retirée.
Utilisateur: ${target.tag} (ID: ${target.id})
Modérateur: ${interaction.user.tag} (ID: ${interaction.user.id})
Action: Utilisateur retiré de la blacklist. ✅
\`\`\``
        });

    }
};
