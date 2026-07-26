const {
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    ActionRowBuilder
} = require("discord.js");

const CustomRole = require("../../../models/CustomRole");

const {
    HEX_REGEX,
    COMMAND_REGEX,
    RESERVED_COMMANDS
} = require("./constants");

const {
    isEligible,
    positionCustomRole,
    commandExists
} = require("./utils");

module.exports = async interaction => {

    if (interaction.isButton()) {

        if (interaction.customId === "customrole_create")
            return showModal(interaction);

    }

    if (interaction.isModalSubmit()) {

        if (interaction.customId === "customrole_modal")
            return submitModal(interaction);

    }

};

async function showModal(interaction) {

    const eligible = await isEligible(
        interaction.member,
        interaction.guild.id
    );

    if (!eligible) {

        return interaction.reply({

            content:
                "❌ Vous devez être booster ou posséder le rôle **Rôle personnalisé**.",

            ephemeral: true

        });

    }

    const existing =
        await CustomRole.findOne({

            guildId: interaction.guild.id,
            userId: interaction.user.id

        });

    const modal = new ModalBuilder()

        .setCustomId("customrole_modal")

        .setTitle(

            existing
                ? "Modifier votre rôle personnalisé"
                : "Créer votre rôle personnalisé"

        );

    const nameInput = new TextInputBuilder()

        .setCustomId("customrole_name")

        .setLabel("Nom du rôle")

        .setStyle(TextInputStyle.Short)

        .setRequired(true)

        .setMaxLength(100);

    if (existing)
        nameInput.setValue(existing.name);

    const colorInput = new TextInputBuilder()

        .setCustomId("customrole_color")

        .setLabel("Couleur (#5865F2)")

        .setStyle(TextInputStyle.Short)

        .setRequired(true)

        .setMaxLength(7);

    if (existing)
        colorInput.setValue(existing.color);

    const iconInput = new TextInputBuilder()

        .setCustomId("customrole_icon")

        .setLabel("Emoji ou URL (optionnel)")

        .setStyle(TextInputStyle.Short)

        .setRequired(false);

    if (existing?.icon)
        iconInput.setValue(existing.icon);

    const commandInput = new TextInputBuilder()

        .setCustomId("customrole_command")

        .setLabel("Commande (ex : ascension)")

        .setStyle(TextInputStyle.Short)

        .setRequired(true)

        .setMaxLength(20);

    if (existing)
        commandInput.setValue(existing.commandName);
   
  modal.addComponents(

        new ActionRowBuilder()

            .addComponents(nameInput),

        new ActionRowBuilder()

            .addComponents(colorInput),

        new ActionRowBuilder()

            .addComponents(iconInput),

        new ActionRowBuilder()

            .addComponents(commandInput)

    );

    return interaction.showModal(modal);

}

async function submitModal(interaction) {

    await interaction.deferReply({
        ephemeral: true
    });

    const eligible = await isEligible(
        interaction.member,
        interaction.guild.id
    );

    if (!eligible) {

        return interaction.editReply(
            "❌ Vous ne remplissez plus les conditions."
        );

    }

    const name = interaction.fields

        .getTextInputValue("customrole_name")

        .trim();

    const rawColor = interaction.fields

        .getTextInputValue("customrole_color")

        .trim();

    const rawIcon = interaction.fields

        .getTextInputValue("customrole_icon")

        ?.trim() || null;

    const commandName = interaction.fields

        .getTextInputValue("customrole_command")

        .trim()

        .toLowerCase();

    if (!HEX_REGEX.test(rawColor)) {

        return interaction.editReply(
            "❌ Couleur invalide."
        );

    }

    if (!COMMAND_REGEX.test(commandName)) {

        return interaction.editReply(
            "❌ Nom de commande invalide."
        );

    }

    if (
        RESERVED_COMMANDS.includes(commandName)
    ) {

        return interaction.editReply(
            "❌ Cette commande est réservée."
        );

    }

    const existingCommand =
        await commandExists(

            interaction.guild.id,

            commandName,

            interaction.user.id

        );

    if (existingCommand) {

        return interaction.editReply(
            `❌ La commande \`+${commandName}\` est déjà utilisée.`
        );

    }

    const existingRole =
        await CustomRole.findOne({

            guildId: interaction.guild.id,

            userId: interaction.user.id

        });

    const isImage =
        rawIcon &&
        /^https?:\/\//i.test(rawIcon);

    const isEmoji =
        rawIcon &&
        !isImage;

    const options = {

        name,

        color: parseInt(
            rawColor.replace("#", ""),
            16
        ),

        reason:
            `Rôle personnalisé de ${interaction.user.tag}`

    };

    if (isImage)
        options.icon = rawIcon;

    if (isEmoji)
        options.unicodeEmoji = rawIcon;

    let role = null;

    if (existingRole) {

        role =
            await interaction.guild.roles
                .fetch(existingRole.roleId)
                .catch(() => null);

    }
  try {

    if (role) {

        await role.edit(options);

    } else {

        role =
            await interaction.guild.roles.create(
                options
            );

        await interaction.member.roles.add(
            role
        );

    }

} catch (err) {

    if (rawIcon && isImage) {

        try {

            delete options.icon;

            if (role) {

                await role.edit(options);

            } else {

                role =
                    await interaction.guild.roles.create(
                        options
                    );

                await interaction.member.roles.add(
                    role
                );

            }

            await CustomRole.findOneAndUpdate(

                {

                    guildId:
                        interaction.guild.id,

                    userId:
                        interaction.user.id

                },

                {

                    guildId:
                        interaction.guild.id,

                    userId:
                        interaction.user.id,

                    roleId:
                        role.id,

                    name,

                    color:
                        rawColor,

                    icon: null,

                    commandName,

                    updatedAt:
                        new Date()

                },

                {

                    upsert: true,

                    setDefaultsOnInsert: true

                }

            );

            await positionCustomRole(

                interaction.guild,

                interaction.member,

                role

            );

            return interaction.editReply(

                "✅ Votre rôle a été enregistré.\n\n⚠️ L'icône image n'a pas pu être appliquée (niveau de boost insuffisant)."

            );

        } catch (e) {

            return interaction.editReply(

                `❌ ${e.message}`

            );

        }

    }

    return interaction.editReply(

        `❌ ${err.message}`

    );

}
  await CustomRole.findOneAndUpdate(

    {

        guildId: interaction.guild.id,

        userId: interaction.user.id

    },

    {

        guildId: interaction.guild.id,

        userId: interaction.user.id,

        roleId: role.id,

        name,

        color: rawColor,

        icon: rawIcon,

        commandName,

        updatedAt: new Date()

    },

    {

        upsert: true,

        setDefaultsOnInsert: true

    }

);

await positionCustomRole(

    interaction.guild,

    interaction.member,

    role

);

return interaction.editReply(

    `✅ Votre rôle personnalisé **${name}** a été ${

        existingRole
            ? "mis à jour"
            : "créé"

    } avec succès !

Vous pouvez maintenant le partager avec la commande :

\`+${commandName} @utilisateur\``

);

}
