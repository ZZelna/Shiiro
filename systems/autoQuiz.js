const CHANNEL_ID = "1508491934547574814";

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

   console.log("✅ Auto Quiz chargé");

   setInterval(async () => {

       if (quizRunning) return;

       const channel = client.channels.cache.get(CHANNEL_ID);
       if (!channel) return;

       quizRunning = true;

       const randomGame = games[Math.floor(Math.random() * games.length)];

       try {
           console.log(`🎯 Quiz lancé : ${randomGame}`);

           const game = require(`../commands/fun/${randomGame}.js`);

           await game.run(
               {
                   channel,
                   author: {
                       id: client.user.id,
                       bot: true
                   },
                   member: null,
                   reply: (content) => channel.send(content) // ✅ reply factice
               },
               [],
               { auto: true }
           );

       } catch (err) {
           console.error(`❌ Erreur AutoQuiz (${randomGame})`, err);
           quizRunning = false; // ✅ reset si erreur
       }

       setTimeout(() => {
           quizRunning = false;
       }, 35000); // ✅ 35s pour couvrir les 30s du collector

   }, 5 * 60 * 1000);

};
