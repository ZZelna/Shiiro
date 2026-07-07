const express = require("express");
const passport = require("passport");
const verifyCaptcha = require("./captcha");

module.exports = (client) => {

    const router = express.Router();

    // Accueil
    router.get("/", (req, res) => {
        res.sendFile(__dirname + "/public/index.html");
    });

    // Connexion Discord
    router.get("/login",
        passport.authenticate("discord")
    );

    // Callback OAuth2
    router.get("/callback",
        passport.authenticate("discord", {
            failureRedirect: "/"
        }),
        async (req, res) => {

            try {

                const GUILD_ID = "1506672014679740546";
                const VERIFY_ROLE_ID = "1506676284070170654";

                const guild = client.guilds.cache.get(GUILD_ID);

                if (!guild)
                    return res.send("Serveur introuvable.");

                const member = await guild.members.fetch(req.user.id).catch(() => null);

                if (!member)
                    return res.send("Vous devez rejoindre le serveur avant de vous vérifier.");

                if (!member.roles.cache.has(VERIFY_ROLE_ID)) {
                    await member.roles.add(VERIFY_ROLE_ID);
                }

                res.redirect("/success");

            } catch (err) {

                console.log(err);

                res.send("Erreur pendant la vérification.");

            }

        }
    );

    // Vérification réussie
    router.get("/success", (req, res) => {

        res.send(`
        <html>
        <head>
            <title>Vérifié</title>
            <style>
                body{
                    background:#0d1117;
                    color:white;
                    display:flex;
                    justify-content:center;
                    align-items:center;
                    height:100vh;
                    font-family:Arial;
                }

                .card{
                    background:#161b22;
                    padding:40px;
                    border-radius:15px;
                    text-align:center;
                }

                h1{
                    color:#57F287;
                }
            </style>
        </head>

        <body>

            <div class="card">
                <h1>✅ Vérification réussie</h1>
                <p>Tu peux retourner sur Discord.</p>
            </div>

        </body>
        </html>
        `);

    });

    module.exports = router;

    return router;

};
