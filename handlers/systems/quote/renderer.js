const { createCanvas, loadImage } = require("@napi-rs/canvas");

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
