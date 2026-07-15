const { createCanvas, loadImage } = require("@napi-rs/canvas");
const Themes = require("./themes");
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

    }

    async drawQuote(ctx, data) {

    }

    async drawAuthor(ctx, data) {

    }

    async drawWatermark(ctx) {

    }

}

module.exports = QuoteRenderer;
