const CHANNEL_ID = "1517885581319868481";

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

   const launchQuiz = async () => {
       const channel = client.channels.cache.get(CHANNEL_ID);
       if (!channel) {
           setTimeout(launchQuiz, 5 * 60 * 1000);
           return;
       }

       const randomGame = games[Math.floor(Math.random() * games.length)];

       try {
           console.log(`🎯 Quiz lancé : ${randomGame}`);

           const game = require(`../commands/fun/${randomGame}.js`);

           // ✅ On passe onEnd comme callback
           await game.run(
               {
                   channel,
                   author: { id: client.user.id, bot: true },
                   member: null,
                   reply: (content) => channel.send(content)
               },
               [],
               {
                   auto: true,
                   onEnd: () => {
                       console.log("✅ Quiz terminé, prochain dans 2 minutes");
                       setTimeout(launchQuiz, 2 * 60 * 1000);
                   }
               }
           );

       } catch (err) {
           console.error(`❌ Erreur AutoQuiz (${randomGame})`, err);
           setTimeout(launchQuiz, 2 * 60 * 1000);
       }
   };

   // ✅ Premier quiz après 1 minute au démarrage
   setTimeout(launchQuiz, 60 * 1000);
};
