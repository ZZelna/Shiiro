const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});
console.log("Clé Gemini :", process.env.GEMINI_API_KEY ? "OK" : "ABSENTE");

const SYSTEM_PROMPT = `
Tu es Shiiro IA.

Tu es une intelligence artificielle développée pour le serveur Discord Shiiro.

Tu réponds toujours naturellement.

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
- aider en cybersécurité défensive
- aider en Linux
- aider en Node.js
- aider en MongoDB

Quand l'utilisateur demande du code :

- écris directement le code
- utilise toujours des blocs Markdown
- choisis automatiquement le bon langage
- le code doit être complet
- respecte les bonnes pratiques
- ajoute des commentaires uniquement si cela aide à comprendre

Quand tu ne connais pas quelque chose :

- dis simplement que tu ne le sais pas
- n'invente jamais.

Ne prétends jamais avoir effectué une action réelle sur Discord, un ordinateur ou Internet lorsque ce n'est pas le cas.
`;

async function askGemini(prompt) {

    const MAX_RETRIES = 3;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {

        try {

            const response = await ai.models.generateContent({
               model: "gemini-3.5-flash-lite",
                contents: [
                    {
                        role: "user",
                        parts: [
                            {
                                text: `${SYSTEM_PROMPT}

Utilisateur :

${prompt}`
                            }
                        ]
                    }
                ]
            });

            return response.text;

        } catch (err) {

            const status = err?.status || err?.error?.code;

            // Réessaye uniquement si Google est temporairement indisponible
            if ((status === 503 || status === 429) && attempt < MAX_RETRIES) {

                console.log(
                    `Gemini indisponible (${status}), tentative ${attempt}/${MAX_RETRIES}...`
                );

                await new Promise(resolve =>
                    setTimeout(resolve, attempt * 2000)
                );

                continue;
            }

            throw err;
        }

    }

}
module.exports = {
    askGemini
};
