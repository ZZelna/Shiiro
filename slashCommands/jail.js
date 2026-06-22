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
    offensants: {
        duration: 10,
        label: "Messages offensants"
    },
    leak: {
        duration: 60,
        label: "Leak (ATT BAN)"
    },
    dox: {
        duration: 60,
        label: "Dox (ATT BAN)"
    },
    swatt: {
        duration: 60,
        label: "Swatt (ATT BAN)"
    },
    menaces: {
        duration: 60,
        label: "Menaces (ATT BAN)"
    },
    nsfw: {
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
        .setDescription("Motif du jail")
        .setRequired(true)
        .addChoices(
            { name: "Spam", value: "spam" },
            { name: "Insultes", value: "insultes" },
            { name: "Messages offensants", value: "offensants" },
            { name: "Leak", value: "leak" },
            { name: "Dox", value: "dox" },
            { name: "Swatt", value: "swatt" },
            { name: "Menaces", value: "menaces" },
            { name: "NSFW", value: "nsfw" },
            { name: "Personnalisé", value: "custom" }
        )
)
.addIntegerOption(option =>
    option
        .setName("minutes")
        .setDescription("Durée personnalisée (uniquement si motif = Personnalisé)")
        .setRequired(false)
),

async execute(interaction) {

        const member =
            interaction.options.getMember("membre");

        const motif = interaction.options.getString("motif");
const customMinutes = interaction.options.getInteger("minutes");

        if (!member) {
            return interaction.reply({
                content: "❌ Membre introuvable.",
                ephemeral: true
            });
        }

        let duration;
let reason;

if (motif === "custom") {

    if (!customMinutes || customMinutes <= 0) {
        return interaction.reply({
            content: "❌ Vous devez préciser une durée en minutes.",
            ephemeral: true
        });
    }

    duration = customMinutes;
    reason = `Personnalisé (${customMinutes} min)`;

} else {

    duration = REASONS[motif].duration;
    reason = REASONS[motif].label;

}
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

       const prisonRole =
    interaction.guild.roles.cache.get(
        JAIL_ROLE
    );

if (!prisonRole) {
    return interaction.reply({
        content: "❌ Rôle prison introuvable.",
        ephemeral: true
    });
}
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
