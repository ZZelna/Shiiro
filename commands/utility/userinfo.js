module.exports = {
    name: "userinfo",

    async run(message) {
        const member =
            message.mentions.members.first() ||
            message.member;

        const user = member.user;

        const roles = member.roles.cache
            .filter(role => role.id !== message.guild.id)
            .map(role => role.toString())
            .join(" ");

        const embed = {
            color: member.displayHexColor === "#000000"
                ? 0x5865F2
                : parseInt(member.displayHexColor.replace("#", ""), 16),

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
                    value: user.id,
                    inline: false
                },
                {
                    name: "👤 Pseudo serveur",
                    value: member.nickname || "Aucun",
                    inline: false
                },
                {
                    name: "📅 Compte créé",
                    value: `<t:${Math.floor(user.createdTimestamp / 1000)}:F>`,
                    inline: false
                },
                {
                    name: "📥 A rejoint le serveur",
                    value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:F>`,
                    inline: false
                },
                {
                    name: "💎 Boost",
                    value: member.premiumSince
                        ? "Oui"
                        : "Non",
                    inline: true
                },
                {
                    name: "🎭 Nombre de rôles",
                    value: `${member.roles.cache.size - 1}`,
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
