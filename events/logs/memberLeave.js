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
- Départ d'un membre.
Utilisateur: ${member.user.tag} (ID: ${member.id})
Action: Utilisateur a quitté le serveur. 😭
\`\`\`
`
    });

};
