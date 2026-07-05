module.exports = {
    name: "serverbanner",

    async run(message) {

        const ALLOWED_ROLE_ID = "1519633572850438225";

        if (!message.member.roles.cache.has(ALLOWED_ROLE_ID)) {
            return message.reply("❌ Vous n'avez pas la permission d'utiliser cette commande.");
        }

        const guild = await message.client.guilds.fetch(message.guild.id);

        if (!guild.banner) {
            return message.reply(
                "❌ Ce serveur ne possède pas de bannière."
            );
        }

        const comments = [
            "🎨 Une bannière magnifique.",
            "✨ Cette bannière représente bien le serveur.",
            "🌌 Un visuel très réussi.",
            "🔥 Une bannière vraiment stylée."
        ];

        const comment =
            comments[Math.floor(Math.random() * comments.length)];

        const embed = {
            color: 0x5865F2,
            title: `🎨 Bannière de ${message.guild.name}`,
            description: comment,
            image: {
                url: guild.bannerURL({
                    size: 1024,
                    forceStatic: false
                })
            },
            footer: {
                text: `Demandé par ${message.author.username}`
            },
            timestamp: new Date()
        };

        message.reply({ embeds: [embed] });
    }
};
