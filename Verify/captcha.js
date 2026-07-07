const axios = require("axios");

async function verifyCaptcha(token) {

    if (!token) return false;

    try {

        const { data } = await axios.post(
            "https://challenges.cloudflare.com/turnstile/v0/siteverify",
            new URLSearchParams({
                secret: process.env.TURNSTILE_SECRET_KEY,
                response: token
            }),
            {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                }
            }
        );

        return data.success === true;

    } catch (err) {

        console.log("Erreur Turnstile :", err.message);

        return false;

    }

}

module.exports = verifyCaptcha;
