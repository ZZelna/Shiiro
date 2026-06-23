const {
    SlashCommandBuilder
} = require("discord.js");

const allowedRoles = [
    "1506709088451690708",
    "1506674274826584284"
];

module.exports = {
    data: new SlashCommandBuilder()
        .setName("renew")
        .setDescription("Recrée le salon actuel"),

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

        const oldChannel = interaction.channel;

        await interaction.reply({
            content: "♻️ Renew du salon...",
            ephemeral: true
        });

        const newChannel =
            await oldChannel.clone({
                name: oldChannel.name,
                topic: oldChannel.topic,
                nsfw: oldChannel.nsfw,
                bitrate: oldChannel.bitrate,
                userLimit: oldChannel.userLimit,
                rateLimitPerUser:
                    oldChannel.rateLimitPerUser,
                parent: oldChannel.parent,
                reason:
                    `Salon renew par ${interaction.user.tag}`
            });

        await newChannel.setPosition(
            oldChannel.position
        );

        await oldChannel.delete(
            `Salon renew par ${interaction.user.tag}`
        );

        await newChannel.send({
            content:
                `♻️ Salon recréé par ${interaction.user}`
        });
    }
};
