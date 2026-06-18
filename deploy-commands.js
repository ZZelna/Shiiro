const { REST, Routes } = require("discord.js");

const commands = [
    {
        name: "jail",
        description: "Met un membre en prison",
        options: [
            {
                name: "membre",
                description: "Le membre à jail",
                type: 6,
                required: true
            }
        ]
    }
];

const rest = new REST({ version: "10" }).setToken(
    process.env.DISCORD_TOKEN
);

(async () => {
    try {

        await rest.put(
            Routes.applicationCommands(
                "1514286969121935400"
            ),
            { body: commands }
        );

        console.log(
            "✅ Slash command /jail enregistrée"
        );

    } catch (error) {
        console.error(error);
    }
})();
