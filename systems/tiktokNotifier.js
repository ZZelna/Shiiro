const axios = require("axios");
const fs = require("fs");
const path = require("path");

const config = require("../config.json");

const APIFY_TOKEN = process.env.APIFY_TOKEN;

const SAVE_FILE = path.join(__dirname, "../data/tiktokCache.json");

if (!fs.existsSync(SAVE_FILE)) {
    fs.writeFileSync(SAVE_FILE, JSON.stringify({}));
}

const cache = JSON.parse(fs.readFileSync(SAVE_FILE));

async function saveCache() {
    fs.writeFileSync(SAVE_FILE, JSON.stringify(cache, null, 2));
}

module.exports = async (client) => {

    console.log("✅ TikTok Notifier chargé.");

    async function checkAccount(username) {

        try {

            const response = await axios.post(
                `https://api.apify.com/v2/acts/clockworks~tiktok-scraper/run-sync-get-dataset-items?token=${APIFY_TOKEN}`,
                {
                    profiles: [username],
                    resultsPerPage: 1
                },
                {
                    headers: {
                        "Content-Type": "application/json"
                    }
                }
            );

            if (!response.data || !response.data.length) return;

            const video = response.data[0];

            if (!cache[username]) {
                cache[username] = video.id;
                await saveCache();
                return;
            }

            if (cache[username] === video.id) return;

            cache[username] = video.id;
            await saveCache();

            const channel = client.channels.cache.get(config.tiktok.channel);

            if (!channel) return;

         await channel.send({
    content: `<@&${config.tiktok.role}>`,
    embeds: [
        {
            color: 0xff0050,
            author: {
                name: `${username} • Nouvelle vidéo TikTok`,
                icon_url:
                    "https://upload.wikimedia.org/wikipedia/commons/a/a9/TikTok_logo.svg"
            },
            description:
                `🎥 **${video.text || "Nouvelle vidéo"}**\n\n` +
                `👤 **@${username}** vient de publier une nouvelle vidéo !`,
            fields: [
                {
                    name: "❤️ Likes",
                    value: `${video.stats?.diggCount || 0}`,
                    inline: true
                },
                {
                    name: "💬 Commentaires",
                    value: `${video.stats?.commentCount || 0}`,
                    inline: true
                },
                {
                    name: "▶️ Vues",
                    value: `${video.stats?.playCount || 0}`,
                    inline: true
                }
            ],
            image: {
                url: video.videoMeta?.coverUrl || video.covers?.default || null
            },
            footer: {
                text: "TikTok Notifier"
            },
            timestamp: new Date().toISOString()
        }
    ]
});
        } catch (err) {
            console.log("Erreur TikTok :", err.message);
        }

    }

    setInterval(async () => {

        for (const account of config.tiktok.accounts) {
            await checkAccount(account);
        }

    }, config.tiktok.interval);

};
