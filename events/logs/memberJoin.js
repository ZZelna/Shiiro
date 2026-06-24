module.exports = async (member) => {

    const logs =
        member.guild.channels.cache.get(
            "1516880006075383909"
        );

    if (!logs) return;

    await logs.send({
        content:
`\
\`\`\`diff
+ Arrivée d'un membre.
Utilisateur: ${member.user.tag} (ID: ${member.id})
Compte créé: ${new Date(member.user.createdTimestamp).toLocaleDateString("fr-FR")}
Action: Utilisateur a rejoint le serveur. 🟢
\`\`\`
`
    });

};
