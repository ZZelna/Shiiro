const fs = require("fs");
const path = require("path");
const {
    SlashCommandBuilder,
    EmbedBuilder
} = require("discord.js");

const jailData = require("../data/jail.json");

const JAIL_ROLE = "1508842233619677306";

const REASONS = {
    spam: {
        duration: 5,
        label: "Spam"
    },
    insultes: {
        duration: 5,
        label: "Insultes"
    },
    nfsw: {
        duration: 60,
        label: "NSFW (ATT BAN)"
    }
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName("jail")
        .setDescription("Jail un membre")
        .addUserOption(option =>
            option
                .setName("membre")
                .setDescription("Membre à jail")
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName("motif")
                .setDescription("spam / insultes / nfsw")
                .setRequired(true)
        ),

    async execute(interaction) {

        const member =
            interaction.options.getMember("membre");

        const motif =
            interaction.options
                .getString("motif")
                .toLowerCase();

        if (!member) {
            return interaction.reply({
                content: "❌ Membre introuvable.",
                ephemeral: true
            });
        }

        if (!REASONS[motif]) {
            return interaction.reply({
                content: "❌ Motif invalide.",
                ephemeral: true
            });
        }

        const prisonRole =
            interaction.guild.roles.cache.get(
                JAIL_ROLE
            );

        const duration =
            REASONS[motif].duration;

        const reason =
            REASONS[motif].label;

        const removedRoles =
            member.roles.cache
                .filter(role =>
                    role.id !== interaction.guild.id &&
                    role.id !== JAIL_ROLE &&
                    !role.managed
                )
                .map(role => role.id);

        if (!jailData.users)
            jailData.users = {};

        jailData.users[member.id] = {
            roles: removedRoles,
            endTime:
                Date.now() +
                duration * 60 * 1000
        };

        fs.writeFileSync(
            path.join(
                __dirname,
                "../data/jail.json"
            ),
            JSON.stringify(
                jailData,
                null,
                4
            )
        );

        const managedRoles =
            member.roles.cache
                .filter(role => role.managed)
                .map(role => role.id);

        await member.roles.set([
            ...managedRoles,
            prisonRole.id
        ]);

        const embed =
            new EmbedBuilder()
                .setColor("Red")
                .setTitle("🔒 Jail")
                .setDescription(
                    `${member} a été jail`
                )
                .addFields(
                    {
                        name: "📌 Motif",
                        value: reason
                    },
                    {
                        name: "⏳ Durée",
                        value: `${duration} minute(s)`
                    }
                )
                .setTimestamp();

        await interaction.reply({
            embeds: [embed]
        });
    }
};
