let quizRunning = false;

module.exports = function startAutoQuiz(client) {

    setInterval(async () => {

        if (quizRunning) return;

        const channel =
        client.channels.cache.get(
            "1508491934547574814"
        );

        if (!channel) return;

        quizRunning = true;

        try {

            const games = [
    "guessanime",
    "guessbrand",
    "guesscapitale",
    "guesscountry",
    "guessflags",
    "guesscouleur",
    "guesscita"
];

            const randomGame =
            games[
                Math.floor(
                    Math.random() *
                    games.length
                )
            ];

            await channel.send(
                `🎯 Lancement automatique : **${randomGame}**`
            );

            // Plus tard :
            // lancer le vrai mini-jeu ici

        } catch (err) {

            console.error(
                "[AUTO QUIZ ERROR]",
                err
            );

        }

        setTimeout(() => {

            quizRunning = false;

        }, 30000);

    }, 5 * 60 * 1000);

};
