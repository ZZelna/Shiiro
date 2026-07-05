module.exports = {
    name: "pic",
    async run(message) {

        const ALLOWED_ROLE_ID = "1519633537156907088";

        if (!message.member.roles.cache.has(ALLOWED_ROLE_ID)) {
            return message.reply("❌ Vous n'avez pas la permission d'utiliser cette commande.");
        }

        const user = message.mentions.users.first() || message.author;

        const comments = [

            `📸 ${user.username} est plutôt photogénique aujourd'hui.`,

            `✨ Cet avatar représente parfaitement ${user.username}.`,

            `🎭 Voici le visage numérique de ${user.username}.`,

            `🌟 Un avatar digne d'une légende.`

        ];

        const comment = comments[Math.floor(Math.random() * comments.length)];

        const embed = {

            color: 0x5865F2,

            title: `🖼️ Avatar de ${user.username}`,

            description: comment,

            image: {

                url: user.displayAvatarURL({

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
