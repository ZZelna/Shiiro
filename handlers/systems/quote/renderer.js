const { createCanvas, loadImage } = require("@napi-rs/canvas");

class QuoteRenderer {

    constructor() {
        this.width = 1200;
        this.height = 630;
    }

    async render(data) {

        const canvas = createCanvas(this.width, this.height);
        const ctx = canvas.getContext("2d");

        return canvas.toBuffer("image/png");

    }

}

module.exports = QuoteRenderer;
