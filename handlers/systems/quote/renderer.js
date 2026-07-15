const {
    createCanvas,
    loadImage
} = require("@napi-rs/canvas");

const Themes = require("./themes");
const wrapText = require("./wrapText");

class QuoteRenderer {

    constructor(options = {}) {

        this.width = options.width || 1200;
        this.height = options.height || 630;

        // Partie réservée à l'image
        this.avatarWidth = 420;

        // Marges
        this.padding = 55;

        // Zone de texte
        this.textX = this.avatarWidth + this.padding;
        this.textWidth = this.width - this.textX - this.padding;

    }

    async render(data) {

        const canvas = createCanvas(
            this.width,
            this.height
        );

        const ctx = canvas.getContext("2d");

        // Thème
        const theme =
            Themes[data.theme] ||
            Themes.shiiro;

        // Fond
        await this.drawBackground(
            ctx,
            theme
        );

        // Avatar
        await this.drawAvatar(
            ctx,
            data.avatar
        );

        // Citation
        await this.drawQuote(
            ctx,
            data.text,
            theme
        );

        // Auteur
        await this.drawAuthor(
            ctx,
            data.author,
            data.username,
            theme
        );

        // Watermark
        await this.drawWatermark(
            ctx
        );

        return canvas.toBuffer("image/png");

    }

    /*────────────────────────────────────*/

async drawBackground(ctx, theme) {

    // Dégradé principal
    const gradient = ctx.createLinearGradient(
        this.avatarWidth,
        0,
        this.width,
        this.height
    );

    gradient.addColorStop(0, theme.colors[0]);
    gradient.addColorStop(1, theme.colors[1]);

    ctx.fillStyle = gradient;
    ctx.fillRect(
        0,
        0,
        this.width,
        this.height
    );

    // Dégradé sombre à gauche
    const shadow = ctx.createLinearGradient(
        this.avatarWidth - 140,
        0,
        this.avatarWidth + 20,
        0
    );

    shadow.addColorStop(
        0,
        "rgba(0,0,0,0)"
    );

    shadow.addColorStop(
        1,
        "rgba(0,0,0,0.85)"
    );

    ctx.fillStyle = shadow;

    ctx.fillRect(
        this.avatarWidth - 140,
        0,
        160,
        this.height
    );

    // Lumière douce en haut
    const glow = ctx.createRadialGradient(
        this.width,
        0,
        20,
        this.width,
        0,
        600
    );

    glow.addColorStop(
        0,
        "rgba(255,255,255,0.08)"
    );

    glow.addColorStop(
        1,
        "rgba(255,255,255,0)"
    );

    ctx.fillStyle = glow;

    ctx.fillRect(
        0,
        0,
        this.width,
        this.height
    );

}

async drawAvatar(ctx, avatar) {

    if (!avatar) {

        ctx.fillStyle = "#1A1A1A";

        ctx.fillRect(
            0,
            0,
            this.avatarWidth,
            this.height
        );

        return;

    }

    try {

        const image = await loadImage(avatar);

        // Effet "cover" comme CSS background-size: cover
        const scale = Math.max(
            this.avatarWidth / image.width,
            this.height / image.height
        );

        const width = image.width * scale;
        const height = image.height * scale;

        const x = (this.avatarWidth - width) / 2;
        const y = (this.height - height) / 2;

        // Coins arrondis
        const radius = 22;

        ctx.save();

        ctx.beginPath();

        ctx.moveTo(radius, 0);
        ctx.lineTo(this.avatarWidth - radius, 0);
        ctx.quadraticCurveTo(
            this.avatarWidth,
            0,
            this.avatarWidth,
            radius
        );

        ctx.lineTo(
            this.avatarWidth,
            this.height - radius
        );

        ctx.quadraticCurveTo(
            this.avatarWidth,
            this.height,
            this.avatarWidth - radius,
            this.height
        );

        ctx.lineTo(radius, this.height);

        ctx.quadraticCurveTo(
            0,
            this.height,
            0,
            this.height - radius
        );

        ctx.lineTo(0, radius);

        ctx.quadraticCurveTo(
            0,
            0,
            radius,
            0
        );

        ctx.closePath();

        ctx.clip();

        // Image
        ctx.drawImage(
            image,
            x,
            y,
            width,
            height
        );

        ctx.restore();

        // Dégradé noir vers la droite
        const fade = ctx.createLinearGradient(
            this.avatarWidth - 120,
            0,
            this.avatarWidth + 40,
            0
        );

        fade.addColorStop(
            0,
            "rgba(0,0,0,0)"
        );

        fade.addColorStop(
            1,
            "rgba(0,0,0,1)"
        );

        ctx.fillStyle = fade;

        ctx.fillRect(
            this.avatarWidth - 120,
            0,
            160,
            this.height
        );

        // Ombre douce
        ctx.fillStyle = "rgba(0,0,0,0.15)";

        ctx.fillRect(
            0,
            0,
            this.avatarWidth,
            this.height
        );

    } catch (err) {

        console.error(
            "Erreur avatar quote :",
            err
        );

        ctx.fillStyle = "#1A1A1A";

        ctx.fillRect(
            0,
            0,
            this.avatarWidth,
            this.height
        );

    }

}


async drawQuote(ctx, text, theme) {

    if (!text) return;

    let fontSize = 54;
    let lines = [];

    do {

ctx.font = `${fontSize}px Arial`;

        lines = wrapText(
            ctx,
            text,
            this.textWidth
        );

        fontSize--;

    } while (

        lines.length * (fontSize + 18) >
        this.height - 220 &&
        fontSize > 24

    );

ctx.font = "28px Arial";

    ctx.fillStyle = theme.text;

    ctx.textBaseline = "middle";

    ctx.textAlign = "left";

    const lineHeight = fontSize + 18;

    const totalHeight =
        lines.length * lineHeight;

    let y =
        (this.height - totalHeight) / 2;

    // Ombre
    ctx.shadowColor = "rgba(0,0,0,.45)";
    ctx.shadowBlur = 14;
    ctx.shadowOffsetY = 2;

    for (const line of lines) {

        ctx.fillText(
            line,
            this.textX,
            y
        );

        y += lineHeight;

    }

    // On retire l'ombre pour le reste
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;

}


    async drawAuthor(ctx, author, username, theme) {

    const x = this.textX;

    const y = this.height - 110;

    ctx.textAlign = "left";
    ctx.textBaseline = "top";

ctx.font = "30px Arial";
    ctx.fillStyle = theme.text;

    ctx.fillText(
        author || "Utilisateur",
        x,
        y
    );

ctx.font = "20px Arial";
    ctx.fillStyle = theme.sub;

    ctx.fillText(
        `@${username || "discord"}`,
        x,
        y + 38
    );

}

async drawWatermark(ctx) {

    ctx.font = "16px sans-serif";

    ctx.fillStyle = "rgba(255,255,255,.30)";

    ctx.textAlign = "right";

    ctx.fillText(

        "Shiiro Quote",

        this.width - 20,

        this.height - 20

    );

}
}

module.exports = QuoteRenderer;
