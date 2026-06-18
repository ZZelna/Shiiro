const fs = require("fs");
const path = require("path");
const {
    SlashCommandBuilder,
    EmbedBuilder
} = require("discord.js");

const jailPath = path.join(
    __dirname,
    "../data/jail.json"
);

module.exports = {
    data: new SlashCommandBuilder()
        .setName("unjail")
        .setDescription("Libère un membre")
        .addUserOption(option =>
            option
                .setName("membre")
                .setDescription("Le membre à libérer")
                .setRequired(true)
        ),

    async execute(interaction) {

        const allowedRoles = [
            "1517238655444451520",
            "1506674274826584284"
        ];

        const hasPermission =
            interaction.member.roles.cache.some(
                role =>
                    allowedRoles.includes(role.id)
            );

        if (!hasPermission) {
            return interaction.reply({
                content:
                    "❌ Vous n'avez pas la permission.",
                ephemeral: true
            });
        }

        const member =
            interaction.options.getMember(
                "membre"
            );

        if (!member) {
            return interaction.reply({
                content:
                    "❌ Membre introuvable.",
                ephemeral: true
            });
        }

        if (!fs.existsSync(jailPath)) {
            return interaction.reply({
                content:
                    "❌ Aucune donnée de jail trouvée.",
                ephemeral: true
            });
        }

        const jailData = JSON.parse(
            fs.readFileSync(
                jailPath,
                "utf8"
            )
        );

        if (
            !jailData.users ||
            !jailData.users[member.id]
        ) {
            return interaction.reply({
                content:
                    "❌ Ce membre n'est pas jail.",
                ephemeral: true
            });
        }

        const oldRoles =
            jailData.users[member.id];

        await member.roles.set(
            oldRoles
        );

        delete jailData.users[member.id];

        fs.writeFileSync(
            jailPath,
            JSON.stringify(
                jailData,
                null,
                4
            )
        );

        const logChannel =
            interaction.guild.channels.cache.get(
                "1517254629820338227"
            );

        if (logChannel) {

            const embed =
                new EmbedBuilder()
                    .setColor("Green")
                    .setTitle("🔓 Unjail")
                    .setDescription(
                        `${member} a été libéré par ${interaction.user}`
                    )
                    .setTimestamp();

            await logChannel.send({
                embeds: [embed]
            });
        }

        return interaction.reply(
            `🔓 ${member} a été libéré et rerank.`
        );
    }
};
