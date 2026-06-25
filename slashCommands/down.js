const { SlashCommandBuilder } = require("discord.js");
const SavedRoles = require("../models/SavedRoles");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("down")
        .setDescription("Derank un membre ou tout le serveur")
        .addUserOption(option =>
            option
                .setName("membre")
                .setDescription("Membre à derank")
                .setRequired(false)
        ),

    async execute(interaction) {

        if (interaction.user.id !== "1418370654251778168") {
            return interaction.reply({
                content: "❌ Seul le propriétaire du bot peut utiliser cette commande.",
                ephemeral: true
            });
        }

        const member = interaction.options.getMember("membre");

        // DOWN ALL
        if (!member) {

            await interaction.reply("⏳ Derank de tous les membres...");

            let total = 0;

            const members = await interaction.guild.members.fetch();

            for (const m of members.values()) {

                if (m.user.bot) continue;

                const roles = m.roles.cache
                    .filter(role =>
                        role.id !== interaction.guild.id &&
                        role.position < interaction.guild.members.me.roles.highest.position &&
                        !role.managed
                    )
                    .map(role => role.id);

                if (!roles.length) continue;

                await SavedRoles.findOneAndUpdate(
                    { userId: m.id },
                    { roles },
                    { upsert: true }
                );

                for (const roleId of roles) {
                    await m.roles.remove(roleId).catch(() => {});
                }

                total++;
            }

            return interaction.editReply(
                `✅ ${total} membres ont été derank.`
            );
        }

        // DOWN MEMBRE

        const roles = member.roles.cache
            .filter(role =>
                role.id !== interaction.guild.id &&
                role.position < interaction.guild.members.me.roles.highest.position &&
                !role.managed
            )
            .map(role => role.id);

        await SavedRoles.findOneAndUpdate(
            { userId: member.id },
            { roles },
            { upsert: true }
        );

        for (const roleId of roles) {
            await member.roles.remove(roleId).catch(() => {});
        }

        return interaction.reply({
            content:
`✅ **Down effectué**

Utilisateur : ${member.user.tag}
ID : ${member.id}
Modérateur : ${interaction.user.tag}

Tous les rôles que le bot pouvait retirer ont été supprimés.`,
        });
    }
};
