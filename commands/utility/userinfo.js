module.exports = {
    name: "userinfo",

    async run(message, args) {

        const member =
            message.mentions.members.first() ||
            message.guild.members.cache.get(args[0]) ||
            message.member;

        const user = member.user;

        const embed = {
            color: 0x5865F2,

            title: `👤 Informations de ${user.username}`,

            thumbnail: {
                url: user.displayAvatarURL({
                    size: 1024,
                    forceStatic: false
                })
            },

            fields: [
                {
                    name: "🆔 ID",
                    value: user.id
                },
                {
                    name: "📅 Compte créé",
                    value: `<t:${Math.floor(user.createdTimestamp / 1000)}:F>`
                },
                {
                    name: "📥 A rejoint le serveur",
                    value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:F>`
                },
                {
                    name: "🤖 Type",
                    value: user.bot ? "Bot" : "Utilisateur"
                }
            ],

            footer: {
                text: `Demandé par ${message.author.username}`
            },

            timestamp: new Date()
        };

        message.reply({
            embeds: [embed]
        });
    }
};
