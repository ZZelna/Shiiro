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

    async drawAvatar(ctx, avatar) {}

    async drawQuote(ctx, text, theme) {}

    async drawAuthor(
        ctx,
        author,
        username,
        theme
    ) {}

    async drawWatermark(ctx) {}

}

module.exports = QuoteRenderer;
