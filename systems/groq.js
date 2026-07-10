const Groq = require("groq-sdk");

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

console.log(
    "Clé Groq :",
    process.env.GROQ_API_KEY ? "OK" : "ABSENTE"
);

const SYSTEM_PROMPT = `
Tu es Shiiro IA.

Tu es une intelligence artificielle développée pour le serveur Discord Shiiro.

Tu réponds naturellement.
Tu tutoies l'utilisateur.
Tu réponds en français sauf si une autre langue est demandée.

Tu peux :
- programmer dans tous les langages
- expliquer du code
- corriger du code
- optimiser du code
- créer des bots Discord
- créer des API
- créer des sites web
- créer des bases de données
- aider en Linux
- aider en Node.js
- aider en MongoDB

Quand l'utilisateur demande du code :
- écris directement le code
- utilise toujours des blocs Markdown
- choisis automatiquement le bon langage
- le code doit être complet

Quand tu ne connais pas quelque chose :
- dis-le simplement
- n'invente jamais.
`;

async function askGroq(prompt) {
    const completion = await groq.chat.completions.create({
        model: "openai/gpt-oss-120b",
        temperature: 0.7,
        messages: [
            {
                role: "system",
                content: SYSTEM_PROMPT
            },
            {
                role: "user",
                content: prompt
            }
        ]
    });

    return completion.choices[0].message.content;
}

module.exports = {
    askGroq
};
