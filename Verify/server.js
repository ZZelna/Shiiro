const express = require("express");
const session = require("express-session");
const passport = require("passport");
const DiscordStrategy = require("passport-discord").Strategy;
const path = require("path");

module.exports = (client) => {

    const app = express();

    // Parser JSON
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    // Fichiers publics
    app.use(express.static(path.join(__dirname, "public")));

    // Session
    app.use(session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: {
            maxAge: 86400000
        }
    }));

    // Passport
    app.use(passport.initialize());
    app.use(passport.session());

    passport.serializeUser((user, done) => done(null, user));
    passport.deserializeUser((user, done) => done(null, user));

    passport.use(new DiscordStrategy(
        {
            clientID: process.env.CLIENT_ID,
            clientSecret: process.env.CLIENT_SECRET,
            callbackURL: process.env.CALLBACK_URL,
            scope: ["identify", "guilds.join"]
        },
        async (accessToken, refreshToken, profile, done) => {

            profile.accessToken = accessToken;

            return done(null, profile);

        }
    ));

    // Routes
    const routes = require("./routes")(client);
    app.use("/", routes);

    // Démarrage
    const PORT = process.env.PORT || 3000;

    app.listen(PORT, () => {
        console.log(`✅ Verification Web lancée sur le port ${PORT}`);
    });

};
