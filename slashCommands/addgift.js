const {
    SlashCommandBuilder,
    ContainerBuilder,
    TextDisplayBuilder,
    MessageFlags
} = require("discord.js");

const CasinoProfile = require("../models/CasinoProfile");

const LOGS_CASINO = "1520766436388245585";

module.exports = {

    data: new SlashCommandBuilder()
        .setName("addgift")
        .setDescription("Ajouter un gift à un joueur")
        .addUserOption(option =>
            option
                .setName("joueur")
                .setDescription("Joueur")
                .setRequired(true)
        ),

    async execute(interaction) {

        const roles = [
            "1506709088451690708",
            "1506674274826584284"
        ];

        if (
            !roles.some(role =>
                interaction.member.roles.cache.has(role)
            )
        ) {
            return interaction.reply({
                content: "❌ Permission refusée.",
                ephemeral: true
            });
        }

        const target = interaction.options.getUser("joueur");

        let profile = await CasinoProfile.findOne({ userId: target.id });

        if (!profile) {
            profile = await CasinoProfile.create({ userId: target.id });
        }

        profile.gifts += 1;

        await profile.save();

        const container = new ContainerBuilder()
            .setAccentColor(0x2ECC71)
            .addTextDisplayComponents(
                new TextDisplayBuilder().setContent("## 🎁 Gift ajouté")
            )
            .addTextDisplayComponents(
                new TextDisplayBuilder().setContent(
                    `${target} possède maintenant **${profile.gifts} Gifts**`
                )
            );

        await interaction.reply({
            components: [container],
            flags: MessageFlags.IsComponentsV2
        });

        try {
            const logsGuild = interaction.client.guilds.cache.find(g =>
                g.channels.cache.has(LOGS_CASINO)
            );
            const logsChannel = logsGuild?.channels.cache.get(LOGS_CASINO);
            if (logsChannel) {
                await logsChannel.send({
                    content: `\`\`\`- Gift ajouté.\nUtilisateur: ${target.username} (ID: ${target.id})\nModérateur: ${interaction.user.username} (ID: ${interaction.user.id})\nGifts total: ${profile.gifts}\nAction: Gift crédité. 🎁\`\`\``
                });
            }
        } catch {}

    }

};
