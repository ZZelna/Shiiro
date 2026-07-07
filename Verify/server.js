const express = require("express");
const session = require("express-session");
const passport = require("passport");
const DiscordStrategy = require("passport-discord").Strategy;

module.exports = (client) => {
    const app = express();

    app.use(express.static("./verify/public"));

    app.use(session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false
    }));

    app.use(passport.initialize());
    app.use(passport.session());

    passport.serializeUser((user, done) => done(null, user));
    passport.deserializeUser((obj, done) => done(null, obj));

    passport.use(new DiscordStrategy({
        clientID: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        callbackURL: process.env.CALLBACK_URL,
        scope: ["identify", "guilds.join"]
    }, async (accessToken, refreshToken, profile, done) => {
        return done(null, profile);
    }));

    app.get("/", (req, res) => {
        res.sendFile(__dirname + "/public/index.html");
    });

    app.get("/auth/discord",
        passport.authenticate("discord")
    );

    app.get("/callback",
        passport.authenticate("discord", {
            failureRedirect: "/"
        }),
        async (req, res) => {
            // Ici on ajoutera le rôle avec ton bot
            res.redirect("/success");
        }
    );

    app.get("/success", (req, res) => {
        res.send("✅ Vérification réussie !");
    });

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Serveur lancé sur le port ${PORT}`);
    });
};
