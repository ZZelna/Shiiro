const { createCanvas, loadImage } = require("@napi-rs/canvas");
const Themes = require("./themes");
const wrapText = require("./wrapText");

class QuoteRenderer {

    constructor(options = {}) {

        this.width = options.width || 1200;
        this.height = options.height || 630;

        this.avatarWidth = 420;
        this.padding = 50;

    }

    async render(data) {

        const canvas = createCanvas(this.width, this.height);
        const ctx = canvas.getContext("2d");

        await this.drawBackground(ctx, data);

        await this.drawAvatar(ctx, data);

        await this.drawQuote(ctx, data);

        await this.drawAuthor(ctx, data);

        await this.drawWatermark(ctx);

        return canvas.toBuffer("image/png");

    }

async drawBackground(ctx, data) {

    const theme = Themes[data.theme] || Themes.noir;

    const gradient = ctx.createLinearGradient(
        this.avatarWidth,
        0,
        this.width,
        this.height
    );

    gradient.addColorStop(0, theme.colors[0]);
    gradient.addColorStop(1, theme.colors[1]);

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, this.width, this.height);

}

async drawAvatar(ctx, data) {

    if (!data.avatar) return;

    try {

        const image = await loadImage(data.avatar);

        const scale = Math.max(
            this.avatarWidth / image.width,
            this.height / image.height
        );

        const width = image.width * scale;
        const height = image.height * scale;

        const x = (this.avatarWidth - width) / 2;
        const y = (this.height - height) / 2;

        ctx.save();

        ctx.beginPath();
        ctx.rect(0, 0, this.avatarWidth, this.height);
        ctx.clip();

        ctx.drawImage(image, x, y, width, height);

        ctx.restore();

        // Dégradé entre l'image et le fond
        const fade = ctx.createLinearGradient(
            this.avatarWidth - 120,
            0,
            this.avatarWidth + 20,
            0
        );

        fade.addColorStop(0, "rgba(0,0,0,0)");
        fade.addColorStop(1, "rgba(0,0,0,1)");

        ctx.fillStyle = fade;
        ctx.fillRect(
            this.avatarWidth - 120,
            0,
            140,
            this.height
        );

    } catch (err) {

        console.error(err);

        ctx.fillStyle = "#222";
        ctx.fillRect(
            0,
            0,
            this.avatarWidth,
            this.height
        );

    }

}

    async drawQuote(ctx, data) {

    const theme =
        Themes[data.theme] || Themes.noir;

    const text = data.text || "";

    const x = this.avatarWidth + 55;

    const maxWidth =
        this.width - x - 60;

    let size = 48;

    let lines;

    do {

        ctx.font = `${size}px sans-serif`;

        lines = wrapText(
            ctx,
            text,
            maxWidth
        );

        size--;

    } while (

        lines.length * (size + 12)
            > this.height - 180

        && size > 22

    );

    // IMPORTANT

    ctx.font = `${size}px sans-serif`;

    ctx.fillStyle = theme.text;

    ctx.textBaseline = "middle";

    const lineHeight = size + 12;

    const totalHeight =
        lines.length * lineHeight;

    let y =
        (this.height - totalHeight) / 2;

    for (const line of lines) {

        ctx.fillText(

            line,

            x,

            y

        );

        y += lineHeight;

    }

}
async drawAuthor(ctx, data) {

    const theme = Themes[data.theme] || Themes.noir;

    const x = this.avatarWidth + 55;

    const nameY = this.height - 95;

    // Nom affiché
    ctx.font = "bold 26px sans-serif";
    ctx.fillStyle = theme.text;
    ctx.textBaseline = "top";
    ctx.fillText(data.author || "Utilisateur", x, nameY);

    // Pseudo Discord
    ctx.font = "18px sans-serif";
    ctx.fillStyle = theme.sub;
    ctx.fillText(
        `@${data.username || "utilisateur"}`,
        x,
        nameY + 35
    );

}
async drawWatermark(ctx) {

    ctx.font = "16px sans-serif";

    ctx.fillStyle = "rgba(255,255,255,0.35)";

    ctx.textAlign = "right";

    ctx.fillText(

        "Generated with Shiiro",

        this.width - 25,

        this.height - 25

    );

    ctx.textAlign = "left";

}

}

module.exports = QuoteRenderer;
