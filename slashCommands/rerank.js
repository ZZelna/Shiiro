const {
    SlashCommandBuilder
} = require("discord.js");

const SavedRoles =
require("../models/SavedRoles");

module.exports = {

    data: new SlashCommandBuilder()

        .setName("rerank")

        .setDescription("Restaure les rôles sauvegardés")

        .addStringOption(option =>
            option
                .setName("mode")
                .setDescription("Membre ou tout le serveur")
                .setRequired(true)
                .addChoices(
                    {
                        name: "membre",
                        value: "member"
                    },
                    {
                        name: "all",
                        value: "all"
                    }
                )
        )

        .addUserOption(option =>
            option
                .setName("membre")
                .setDescription("Membre à rerank")
                .setRequired(false)
        ),

    async execute(interaction) {

        if (
            interaction.user.id !==
            "1418370654251778168"
        ) {

            return interaction.reply({
                content:
                "❌ Seul le propriétaire du bot peut utiliser cette commande.",
                ephemeral: true
            });

        }

        const mode =
            interaction.options.getString("mode");

        // =========================
        // RERANK D'UN MEMBRE
        // =========================

        if (mode === "member") {

            const member =
                interaction.options.getMember("membre");

            if (!member) {

                return interaction.reply({
                    content:
                    "❌ Tu dois préciser un membre.",
                    ephemeral: true
                });

            }

            const saved =
                await SavedRoles.findOne({
                    userId: member.id
                });

            if (!saved) {

                return interaction.reply({
                    content:
                    "❌ Aucun rôle sauvegardé.",
                    ephemeral: true
                });

            }

            try {

                await member.roles.add(saved.roles);

                return interaction.reply({
                    content:
                    `✅ ${member.user.tag} rerank avec succès.`
                });

            } catch {

                return interaction.reply({
                    content:
                    "❌ Impossible de restaurer les rôles.",
                    ephemeral: true
                });

            }

        }

        // =========================
        // RERANK ALL
        // =========================

        if (mode === "all") {

            await interaction.reply(
                "⏳ Rerank de tous les membres..."
            );

            const members =
                await interaction.guild.members.fetch();

            const saves =
                await SavedRoles.find();

            let count = 0;

            for (const save of saves) {

                const member =
                    members.get(save.userId);

                if (!member) continue;

                try {

                    await member.roles.add(save.roles);

                    count++;

                } catch {}

            }

            return interaction.editReply(
                `✅ ${count} membre(s) rerank.`
            );

        }

    }

};
