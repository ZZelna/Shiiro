const {
    SlashCommandBuilder
} = require("discord.js");

const fs = require("fs");
const path = require("path");

const jailPath = path.join(
    __dirname,
    "../data/jail.json"
);

module.exports = {
    data: new SlashCommandBuilder()
        .setName("jail")
        .setDescription("Met un membre en prison")
        .addUserOption(option =>
            option
                .setName("membre")
                .setDescription("Le membre à jail")
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

        const prisonRole =
            interaction.guild.roles.cache.get(
                "1508842233619677306"
            );

        if (!prisonRole) {
            return interaction.reply({
                content:
                    "❌ Rôle prison introuvable.",
                ephemeral: true
            });
        }

        let jailData = {
            users: {}
        };

        if (fs.existsSync(jailPath)) {
            jailData = JSON.parse(
                fs.readFileSync(
                    jailPath,
                    "utf8"
                )
            );
        }

        if (
            jailData.users &&
            jailData.users[member.id]
        ) {
            return interaction.reply({
                content:
                    "❌ Ce membre est déjà jail.",
                ephemeral: true
            });
        }

        const oldRoles =
            member.roles.cache
                .filter(
                    role =>
                        role.id !==
                        interaction.guild.id
                )
                .map(role => role.id);

        jailData.users[member.id] =
            oldRoles;

        fs.writeFileSync(
            jailPath,
            JSON.stringify(
                jailData,
                null,
                4
            )
        );

        await member.roles.set([
            prisonRole.id
        ]);

        return interaction.reply(
            `🔒 ${member} a été jail par ${interaction.user}`
        );
    }
};
