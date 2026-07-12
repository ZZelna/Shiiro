const {
    SlashCommandBuilder,
    PermissionFlagsBits,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ContainerBuilder,
    TextDisplayBuilder,
    SectionBuilder,
    SeparatorBuilder,
    SeparatorSpacingSize,
    MessageFlags
} = require("discord.js");

const Config = require("../models/ConfessionConfig");

module.exports = {

    data: new SlashCommandBuilder()
        .setName("confession")
        .setDescription("Gestion du système de confessions")

        .addSubcommand(sub =>
            sub
                .setName("config")
                .setDescription("Configurer le système")

                .addChannelOption(option =>
                    option
                        .setName("salon")
                        .setDescription("Salon des confessions")
                        .setRequired(true)
                )

                .addChannelOption(option =>
                    option
                        .setName("logs")
                        .setDescription("Salon des logs")
                        .setRequired(true)
                )

                .addRoleOption(option =>
                    option
                        .setName("moderateur")
                        .setDescription("Rôle modérateur")
                        .setRequired(true)
                )
        )

        .addSubcommand(sub =>
            sub
                .setName("panel")
                .setDescription("Envoyer le panneau")
        )

        .setDefaultMemberPermissions(
            PermissionFlagsBits.ManageGuild
        ),

    async execute(interaction) {

        const sub = interaction.options.getSubcommand();

        if (sub === "config") {

            const channel =
                interaction.options.getChannel("salon");

            const logs =
                interaction.options.getChannel("logs");

            const role =
                interaction.options.getRole("moderateur");

            await Config.findOneAndUpdate(
                {
                    guildId: interaction.guild.id
                },
                {
                    guildId: interaction.guild.id,
                    confessionChannel: channel.id,
                    logChannel: logs.id,
                    moderatorRole: role.id
                },
                {
                    upsert: true,
                    new: true
                }
            );

            return interaction.reply({
                content:
                    "✅ Configuration enregistrée.",
                ephemeral: true
            });

        }

    if (sub === "panel") {

    const config = await Config.findOne({
        guildId: interaction.guild.id
    });

    if (!config) {
        return interaction.reply({
            content: "❌ Configure d'abord le système avec `/confession config`.",
            ephemeral: true
        });
    }

    // Supprime l'ancien panel s'il existe
    if (config.panelChannel && config.panelMessage) {

        try {

            const oldChannel = interaction.guild.channels.cache.get(config.panelChannel);

            if (oldChannel) {

                const oldMessage = await oldChannel.messages.fetch(config.panelMessage);

                if (oldMessage) await oldMessage.delete();

            }

        } catch (e) {}

    }

    const guildIcon = interaction.guild.iconURL({ dynamic: true });

    const container = new ContainerBuilder()
        .setAccentColor(0x5865F2);

    // ─── En-tête avec miniature (icône serveur) ──────────────────────────
    if (guildIcon) {
        container.addSectionComponents(
            new SectionBuilder()
                .addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(
                        `${interaction.guild.name} • Confessions`
                    ),
                    new TextDisplayBuilder().setContent("## 🤫 Confessions anonymes")
                )
                .setThumbnailAccessory(
                    thumbnail => thumbnail.setURL(guildIcon)
                )
        );
    } else {
        container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(`${interaction.guild.name} • Confessions`),
            new TextDisplayBuilder().setContent("## 🤫 Confessions anonymes")
        );
    }

    container.addSeparatorComponents(
        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
    );

    container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
            `## Bienvenue !\n\n` +
            `Exprime-toi librement grâce au système de confessions anonymes.`
        )
    );

    container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
            `### 🔒 Anonymat garanti\n` +
            `> • Ton identité reste secrète.\n` +
            `> • Les membres ne verront jamais ton pseudo.\n` +
            `> • Les modérateurs voient uniquement l'auteur avant validation.`
        )
    );

    container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
            `### 📜 Règles\n` +
            `> • Respect obligatoire.\n` +
            `> • Pas de spam.\n` +
            `> • Pas d'insultes.\n` +
            `> • Pas de contenu interdit.\n\n` +
            `Clique simplement sur **🤫 Confesse-toi** ci-dessous.`
        )
    );

    container.addSeparatorComponents(
        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
    );

    container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent("-# Système de confessions")
    );

    container.addActionRowComponents(
        new ActionRowBuilder().addComponents(

            new ButtonBuilder()
                .setCustomId("confession_create")
                .setEmoji("🤫")
                .setLabel("Confesse-toi")
                .setStyle(ButtonStyle.Primary),

            new ButtonBuilder()
                .setCustomId("confession_info")
                .setEmoji("ℹ️")
                .setLabel("Informations")
                .setStyle(ButtonStyle.Secondary)

        )
    );

    const msg = await interaction.channel.send({
        components: [container],
        flags: MessageFlags.IsComponentsV2
    });

    // Épingler automatiquement
    try {
        await msg.pin();
    } catch (e) {
        console.log("Impossible d'épingler le panel :", e);
    }

    // Sauvegarde du nouveau panel
    config.panelChannel = interaction.channel.id;
    config.panelMessage = msg.id;

    await config.save();

    return interaction.reply({
        content: "✅ Nouveau panneau créé et épinglé.",
        ephemeral: true
    });

}

    }

};
