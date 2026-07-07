const axios = require("axios");

async function verifyCaptcha(token, ip = null) {

    if (!token) return false;

    try {

        const params = new URLSearchParams();

        params.append("secret", process.env.TURNSTILE_SECRET_KEY);
        params.append("response", token);

        if (ip) {
            params.append("remoteip", ip);
        }

        const { data } = await axios.post(
            "https://challenges.cloudflare.com/turnstile/v0/siteverify",
            params,
            {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                }
            }
        );

        return data.success === true;

    } catch (err) {

        console.error("Erreur Turnstile :", err.response?.data || err.message);

        return false;

    }

}

module.exports = verifyCaptcha;
