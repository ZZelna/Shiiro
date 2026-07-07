const express = require("express");
const passport = require("passport");
const verifyCaptcha = require("./captcha");

module.exports = (client) => {

    const router = express.Router();

    // Page principale
    router.get("/", (req, res) => {
        res.sendFile(__dirname + "/public/index.html");
    });

    // Vérification Cloudflare Turnstile
    router.post("/verify-captcha", async (req, res) => {

        const valid = await verifyCaptcha(req.body.token);

        if (!valid) {
            return res.json({
                success: false
            });
        }

        req.session.captcha = true;

        return res.json({
            success: true
        });

    });

    // Connexion Discord
    router.get("/login",
        passport.authenticate("discord")
    );

    // Callback Discord
    router.get("/callback",
        passport.authenticate("discord", {
            failureRedirect: "/"
        }),
        async (req, res) => {

            // L'utilisateur doit avoir réussi le captcha
            if (!req.session.captcha) {
                return res.redirect("/");
            }

            try {

                const GUILD_ID = "1506672014679740546";
                const VERIFY_ROLE_ID = "1506676284070170654";

                const guild = client.guilds.cache.get(GUILD_ID);

                if (!guild) {
                    return res.send("Serveur introuvable.");
                }

                const member = await guild.members.fetch(req.user.id).catch(() => null);

                if (!member) {
                    return res.send("Vous devez rejoindre le serveur avant de vous vérifier.");
                }

                if (!member.roles.cache.has(VERIFY_ROLE_ID)) {
                    await member.roles.add(VERIFY_ROLE_ID);
                }

                // On évite de réutiliser le captcha
                req.session.captcha = false;

                res.redirect("/success");

            } catch (err) {

                console.error(err);

                res.send("Erreur pendant la vérification.");

            }

        }
    );

    // Page succès
    router.get("/success", (req, res) => {

        res.send(`
<!DOCTYPE html>
<html lang="fr">

<head>

<meta charset="UTF-8">

<title>Vérifié</title>

<style>

body{
background:#0d1117;
color:white;
display:flex;
justify-content:center;
align-items:center;
height:100vh;
font-family:Arial,sans-serif;
margin:0;
}

.card{
background:#161b22;
padding:40px;
border-radius:15px;
text-align:center;
box-shadow:0 0 30px rgba(0,0,0,.5);
}

h1{
color:#57F287;
margin-bottom:10px;
}

p{
color:#d1d5db;
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

    return router;

};
