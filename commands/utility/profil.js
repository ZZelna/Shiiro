module.exports = {
    name: "profil",

    async run(message, args) {

        const member =
            message.mentions.members.first() ||
            message.guild.members.cache.get(args[0]) ||
            message.member;

        const user = member.user;

        const roles = member.roles.cache
            .filter(role => role.id !== message.guild.id)
            .map(role => role.toString())
            .join(" ");

        const embed = {
            color: 0x5865F2,

            title: `📊 Profil de ${user.username}`,

            thumbnail: {
                url: user.displayAvatarURL({
                    size: 1024,
                    forceStatic: false
                })
            },

            fields: [
                {
                    name: "👤 Pseudo serveur",
                    value: member.nickname || "Aucun"
                },
                {
                    name: "🎭 Nombre de rôles",
                    value: `${member.roles.cache.size - 1}`,
                    inline: true
                },
                {
                    name: "📅 Arrivé le",
                    value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:F>`,
                    inline: true
                },
                {
                    name: "📋 Rôles",
                    value: roles || "Aucun rôle"
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
