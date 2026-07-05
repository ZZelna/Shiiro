module.exports = {
    name: "picserver",

    async run(message) {

        const ALLOWED_ROLE_ID = "1519633537156907088";

        if (!message.member.roles.cache.has(ALLOWED_ROLE_ID)) {
            return message.reply("❌ Vous n'avez pas la permission d'utiliser cette commande.");
        }

        const comments = [
            "🖼️ Voici l'icône du serveur.",
            "✨ Une belle image pour représenter cette communauté.",
            "🏠 L'identité visuelle du serveur.",
            "🌟 Une icône qui attire le regard."
        ];

        const comment =
            comments[Math.floor(Math.random() * comments.length)];

        const embed = {
            color: 0x5865F2,
            title: `🖼️ Icône de ${message.guild.name}`,
            description: comment,
            image: {
                url: message.guild.iconURL({
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
