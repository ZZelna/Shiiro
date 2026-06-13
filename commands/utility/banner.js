module.exports = {
    name: "banner",

    async run(message) {
        const target = message.mentions.users.first() || message.author;

        const user = await message.client.users.fetch(target.id, {
            force: true
        });

        if (!user.banner) {
            return message.reply("❌ Cet utilisateur n'a pas de bannière.");
        }

        const comments = [
            `🎨 Une bannière qui attire le regard.`,
            `✨ ${user.username} sait soigner son profil.`,
            `🌌 Cette bannière a beaucoup de caractère.`,
            `🔥 Une bannière vraiment stylée.`,
            `👀 Ça mérite qu'on s'y attarde quelques secondes.`,
            `🎭 La bannière parfaite pour compléter le profil.`
        ];

        const comment = comments[Math.floor(Math.random() * comments.length)];

        const embed = {
            color: 0x5865F2,
            title: `🎨 Bannière de ${user.username}`,
            description: comment,
            image: {
                url: user.bannerURL({
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
