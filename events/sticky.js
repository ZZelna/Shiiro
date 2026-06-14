const stickyMessages = {

    "1514677335293563012": `**Uniquement des commandes ici !!! Pas de discussions !!!**`,

    "1506684777678377001": `**Uniquement des commandes ici !!! Pas de discussions !!!**`,

    "1506688699893809152": `**Uniquement des images ou des vidéos ici !!! Pas de discussions !!!**`,

    "1506939756058120202": `__**Stickied Message:**__

un chiffre a la fois merci !!!!`,

    "1506960053368782919": `__**Stickied Message:**__

uniquement des suggestions ici 👈

Les owners répondront aux suggestions au plus vite !!!`,

    "1510484744767410206": `**Vous pouvez bump le serveur toutes les 2h merci à tous ceux qui le font !!!**`,

    "1509881074417799168": `**uniquement des citations ici !!!!**`,

    "1506944756524253284": `## ✔️  __Demande de bannissement :__
-# Envoyez les preuves dans un seul message.

|| <@&1507082580414173234> ||

\`\`👤  Pseudo / ID :

\`\`❓ Raison du bannissement :

\`\`📌 Preuve (screen) :`,

    "1508433969711153203": `**Personne :** …

**Rank :** …

**Raison :** …

**Par :** …`,

    "1507078497959546983": `# Format :

~~                      ~~

\`\`\`
**PSEUDO :**
**RANK :**
**RAISON :**
**DURÉE :**
**PING :**
\`\`\``,

    "1506942496884785152": `__**Stickied Message:**__

**Bienvenue dans le salon confession de Shiiro**

Ici la règle principale est l’anonymat : Tu peux donc envoyer tes confessions en toute liberté mais veille à ne pas trop en abuser non plus 😰

- **Ca peut être une anecdote**
- **Secrets**
- **Révélations**
- **Crush**
- **Blagues**

Bref tout ce qui te traverse à l’esprit

C’est ici : 👈
https://ngl.link/jestonoff11941`
};

const lastSticky = new Map();
const cooldown = new Map();

module.exports = async (message) => {

    if (message.author.bot) return;

    const stickyContent =
        stickyMessages[message.channel.id];

    if (!stickyContent) return;

    try {

        const oldSticky =
            lastSticky.get(message.channel.id);

        if (oldSticky) {

            const oldMessage =
                await message.channel.messages.fetch(oldSticky);

            await oldMessage.delete().catch(() => {});
        }

        const sticky =
            await message.channel.send(stickyContent);

        lastSticky.set(
            message.channel.id,
            sticky.id
        );

    } catch (err) {
        console.error(err);
    }
};
