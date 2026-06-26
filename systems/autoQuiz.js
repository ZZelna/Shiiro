const CHANNEL_ID =
"1508491934547574814";

let quizRunning = false;

module.exports = (client) => {

    const games = [
        "guessanime",
        "guessbrand",
        "guesscapitale",
        "guesscita",
        "guesscouleur",
        "guesscountry",
        "guessflags"
    ];

    console.log(
        "✅ Auto Quiz chargé"
    );

    setInterval(
        async () => {

            if (quizRunning)
                return;

            const channel =
                client.channels.cache.get(
                    CHANNEL_ID
                );

            if (!channel)
                return;

            quizRunning = true;

            const randomGame =
                games[
                    Math.floor(
                        Math.random() *
                        games.length
                    )
                ];

            try {

                console.log(
                    `🎯 Quiz lancé : ${randomGame}`
                );

                const game =
                    require(
                        `../commands/fun/${randomGame}.js`
                    );

              await game.run(
    {
        channel,
        author: {
            id: client.user.id,
            bot: true
        },
        member: null
    },
    [],
    { auto: true } // ← ajoute ça
);

            } catch (err) {

                console.error(
                    `❌ Erreur AutoQuiz (${randomGame})`,
                    err
                );

            }

            setTimeout(
                () => {

                    quizRunning = false;

                },
                30000
            );

        },
        5 * 60 * 1000
    );

};
