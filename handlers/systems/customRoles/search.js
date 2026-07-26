const {
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder
} = require("discord.js");

const CustomRole = require("../../../models/CustomRole");

module.exports = async interaction => {

    if (interaction.isButton()) {

        if (
            interaction.customId ===
            "customroles_search"
        ) {

            return showModal(interaction);

        }

    }

    if (interaction.isModalSubmit()) {

        if (
            interaction.customId ===
            "customroles_search_modal"
        ) {

            return submit(interaction);

        }

    }

};

async function showModal(interaction) {

    const modal = new ModalBuilder()

        .setCustomId(
            "customroles_search_modal"
        )

        .setTitle(
            "Rechercher un rôle personnalisé"
        );

    const input =
        new TextInputBuilder()

            .setCustomId("query")

            .setLabel(
                "Nom, commande, ID ou mention"
            )

            .setPlaceholder(
                "ascension, +ascension, 123..., @Utilisateur..."
            )

            .setRequired(true)

            .setStyle(
                TextInputStyle.Short
            )

            .setMaxLength(100);

    modal.addComponents(

        new ActionRowBuilder()

            .addComponents(input)

    );

    return interaction.showModal(
        modal
    );

}
async function submit(interaction) {

    await interaction.deferReply({
        ephemeral: true
    });

    let query = interaction.fields
        .getTextInputValue("query")
        .trim();

    let customRole = null;

    // Mention
    if (/^<@!?(\d+)>$/.test(query)) {

        const id = query.replace(/[<@!>]/g, "");

        customRole = await CustomRole.findOne({

            guildId: interaction.guild.id,

            userId: id

        });

    }

    // ID
    else if (/^\d{17,20}$/.test(query)) {

        customRole =

            await CustomRole.findOne({

                guildId: interaction.guild.id,

                $or: [

                    { userId: query },

                    { roleId: query }

                ]

            });

    }

    // Commande
    else if (query.startsWith("+")) {

        query = query.slice(1).toLowerCase();

        customRole =

            await CustomRole.findOne({

                guildId: interaction.guild.id,

                commandName: query

            });

    }

    // Nom
    else {

        customRole =

            await CustomRole.findOne({

                guildId: interaction.guild.id,

                name: new RegExp(

                    "^" +

                    query +

                    "$",

                    "i"

                )

            });

    }

    if (!customRole) {

        return interaction.editReply({

            content:
                "❌ Aucun rôle personnalisé trouvé."

        });

    }

    const discordRole =
        interaction.guild.roles.cache.get(
            customRole.roleId
        );

    const owner =
        await interaction.client.users
            .fetch(customRole.userId)
            .catch(() => null);

    const members =
        discordRole
            ? [...discordRole.members.values()]
            : [];

    const memberList =
        members.length

            ? members

                .slice(0, 20)

                .map(

                    (m, i) =>

                        `**${i + 1}.** ${m.user.tag} (\`${m.id}\`)`

                )

                .join("\n")

            : "Aucun membre.";

    const created =
        customRole.createdAt

            ? `<t:${Math.floor(

                customRole.createdAt.getTime() / 1000

            )}:F>`

            : "Inconnue";

    const row =
        new ActionRowBuilder()

            .addComponents(

                new ButtonBuilder()

                    .setCustomId(
                        `rename_${customRole._id}`
                    )

                    .setLabel("Renommer")

                    .setEmoji("✏️")

                    .setStyle(ButtonStyle.Primary),

                new ButtonBuilder()

                    .setCustomId(
                        `modify_${customRole._id}`
                    )

                    .setLabel("Modifier")

                    .setEmoji("🎨")

                    .setStyle(ButtonStyle.Secondary),

                new ButtonBuilder()

                    .setCustomId(
                        `transfer_${customRole._id}`
                    )

                    .setLabel("Transférer")

                    .setEmoji("👑")

                    .setStyle(ButtonStyle.Success),

                new ButtonBuilder()

                    .setCustomId(
                        `delete_${customRole._id}`
                    )

                    .setLabel("Supprimer")

                    .setEmoji("🗑️")

                    .setStyle(ButtonStyle.Danger)

            );

    return interaction.editReply({

        embeds: [

            new EmbedBuilder()

                .setColor(customRole.color)

                .setTitle(`🎭 ${customRole.name}`)

                .setDescription(

`## Informations du rôle

🏷️ **Nom**
${customRole.name}

⌨️ **Commande**
\`+${customRole.commandName}\`

🎨 **Couleur**
\`${customRole.color}\`

🆔 **ID**
\`${customRole.roleId}\`

📅 **Création**
${created}

👤 **Propriétaire**
${owner
? `${owner.tag}\n\`${owner.id}\``
: "Utilisateur introuvable"}

👥 **Nombre de membres**
${members.length}

🤝 **Partagé avec**
${customRole.sharedWith.length}

### Membres

${memberList}`

                )

        ],

        components: [row]

    });

}
