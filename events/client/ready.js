const { ActivityType, REST, Routes } = require("discord.js");

const statsVoice = require("../../events/ready/statsVoice");
const autoQuiz = require("../../systems/autoQuiz");

module.exports = {

    name: "clientReady",

    once: true,

    async execute(client) {

        console.log(`${client.user.tag} est connecté !`);

        await statsVoice(client);

        // ===== Snapshot des rôles =====
        try {

            const mainGuild = client.guilds.cache.get("1506672014679740546");

            if (mainGuild) {

                const allMembers = await mainGuild.members.fetch();

                allMembers.forEach(member => {

                    member.roles.cache.forEach(role => {

                        if (!client.roleMemberSnapshot.has(role.id))
                            client.roleMemberSnapshot.set(role.id, new Set());

                        client.roleMemberSnapshot
                            .get(role.id)
                            .add(member.id);

                    });

                });

                console.log("✅ Snapshot rôles initialisé");

            }

        } catch (err) {

            console.error(err);

        }

        client.user.setPresence({

            activities: [{
                name: ".gg/shiiro",
                type: ActivityType.Streaming,
                url: "https://twitch.tv/leox123bs"
            }],

            status: "dnd"

        });

        autoQuiz(client);

        console.log("🎯 AutoQuiz démarré");

        const commands = [];

        client.slashCommands.forEach(cmd => {

            commands.push(cmd.data.toJSON());

        });

        const rest = new REST({
            version: "10"
        }).setToken(process.env.DISCORD_TOKEN);

        try {

            await rest.put(
                Routes.applicationCommands(client.user.id),
                {
                    body: commands
                }
            );

            console.log("✅ Slash enregistrées");

        } catch (err) {

            console.error(err);

        }

    }

};
