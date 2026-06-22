const stickyMessages = {

    "1514677335293563012": `__**Stickied Message:**__

**Uniquement des commandes ici !!! Pas de discussions !!!**`,

    "1506684777678377001": `__**Stickied Message:**__

**Uniquement des commandes ici !!! Pas de discussions !!!**`,

    "1506688699893809152": `__**Stickied Message:**__

**Uniquement des images ou des vidéos ici !!! Pas de discussions !!!**`,

    "1506939756058120202": `__**Stickied Message:**__

un chiffre à la fois merci !!!!`,

    "1506960053368782919": `__**Stickied Message:**__

uniquement des suggestions ici 👈

Les owners répondront aux suggestions au plus vite !!!`,

    "1510484744767410206": `__**Stickied Message:**__

**Vous pouvez bump le serveur toutes les 2h merci à tous ceux qui le font !!!**`,

    "1509881074417799168": `__**Stickied Message:**__

**uniquement des citations ici !!!!**`,

    "1506944756524253284": `__**Stickied Message:**__

## ✔️ Demande de bannissement

- Envoyez les preuves dans un seul message.

|| <@&1507082580414173234> ||

\`\`👤 Pseudo / ID :

\`\`❓ Raison du bannissement :

\`\`📌 Preuve (screen) :`,

    "1508433969711153203": `__**Stickied Message:**__

**Personne :** …

**Rank :** …

**Raison :** …

**Par :** …`,

    "1506942496884785152": `__**Stickied Message:**__

**Bienvenue dans le salon confession de Shiiro**

Ici la règle principale est l’anonymat : tu peux envoyer tes confessions en toute liberté mais veille à ne pas trop en abuser 😰

- **Anecdotes**
- **Secrets**
- **Révélations**
- **Crush**
- **Blagues**

Bref, tout ce qui te traverse l’esprit.

C’est ici : 👈
https://ngl.link/jestonoff11941`,
};
   
"1507164423276466268": `__**Stickied Message:**__

## Commande : /jail

### Durées de Jail

- Spam = 5 minutes
- Insultes = 5 minutes (+5 minutes si récidive)
- Messages offensants = 10 minutes
- Leak / Dox / Swatt / Menaces = 60 minutes (ATT BAN)
- NSFW = 60 minutes (ATT BAN)`,
    


"1507078497959546983": `__**Stickied Message:**__

# Format :

~~                      ~~

\`\`\`

**PSEUDO :**

**RANK :**

**RAISON :**

**DURÉE :**

**PING :** vos managers ou directeurs ou superviseurs en fonction de votre mission/équipe

\`\`\``,
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

    try {

        const oldMessage =
            await message.channel.messages.fetch(oldSticky);

        await oldMessage.delete().catch(() => {});

    } catch {

        lastSticky.delete(message.channel.id);

    }
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
