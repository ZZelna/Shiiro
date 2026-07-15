function wrapText(ctx, text, maxWidth) {

    const words = text.split(" ");

    const lines = [];

    let current = "";

    for (const word of words) {

        const test = current
            ? `${current} ${word}`
            : word;

        if (
            ctx.measureText(test).width > maxWidth &&
            current
        ) {

            lines.push(current);

            current = word;

        } else {

            current = test;

        }

    }

    if (current)
        lines.push(current);

    return lines;

}

module.exports = wrapText;
