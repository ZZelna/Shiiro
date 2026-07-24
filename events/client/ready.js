
const {
    REST,
    Routes,
    ActivityType
} = require("discord.js");

const statsVoice = require("../ready/statsVoice");
const autoQuiz = require("../../systems/autoQuiz");

module.exports = async (
    client,
    snapshotAddMember
) => {

    console.log(`${client.user.tag} est connecté !`);

    await statsVoice(client);

    try {
        const mainGuild = client.guilds.cache.get("1506672014679740546");

        if (mainGuild) {
            const allMembers = await mainGuild.members.fetch();

            allMembers.forEach(member => {
                member.roles.cache.forEach(role => {
                    snapshotAddMember(role.id, member.id);
                });
            });

            console.log("✅ Snapshot initialisé");
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

    const commands = [];

    client.slashCommands.forEach(cmd => {
        commands.push(cmd.data.toJSON());
    });

    const rest = new REST({ version: "10" })
        .setToken(process.env.DISCORD_TOKEN);

    await rest.put(
        Routes.applicationCommands(client.user.id),
        { body: commands }
    );

    console.log("✅ Slash commands enregistrées");
};
