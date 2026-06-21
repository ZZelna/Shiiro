const {
    createCanvas,
    loadImage
} = require("@napi-rs/canvas");

const path = require("path");

module.exports = async (
    member,
    stats
) => {

    const canvas =
        createCanvas(
            1280,
            720
        );

    const ctx =
        canvas.getContext("2d");

    const background =
        await loadImage(
            path.join(
                __dirname,
                "../assets/stats/template.png"
            )
        );

    ctx.drawImage(
        background,
        0,
        0,
        1280,
        720
    );

    const avatar =
        await loadImage(
            member.displayAvatarURL({
                extension: "png",
                size: 512
            })
        );

    ctx.drawImage(
        avatar,
        15,
        15,
        100,
        100
    );

    ctx.fillStyle =
        "#FFFFFF";

    ctx.font =
        "bold 45px Arial";

    ctx.fillText(
        member.username,
        135,
        60
    );

    ctx.font =
        "28px Arial";

    ctx.fillText(
        `${stats.messages}`,
        835,
        260
    );

    ctx.fillText(
        `${stats.messages7d}`,
        835,
        330
    );

    ctx.fillText(
        `${stats.messages14d}`,
        835,
        400
    );

    return canvas.encode("png");

};
