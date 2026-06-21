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

    // Avatar

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

    // Pseudo

    ctx.fillStyle =
        "#FFFFFF";

    ctx.font =
        "bold 45px Arial";

    ctx.fillText(
        member.user.username,
        135,
        60
    );

    // Serveur

    ctx.font =
        "26px Arial";

    ctx.fillStyle =
        "#E0E0E0";

    ctx.fillText(
        member.guild.name,
        135,
        105
    );

    // Date création compte

    const createdAt =
        member.user.createdAt
            .toLocaleDateString(
                "fr-FR"
            );

    ctx.font =
        "28px Arial";

    ctx.fillStyle =
        "#FFFFFF";

    ctx.fillText(
        createdAt,
        845,
        95
    );

    // Date arrivée serveur

    const joinedAt =
        member.joinedAt
            ?.toLocaleDateString(
                "fr-FR"
            ) || "N/A";

    ctx.fillText(
        joinedAt,
        1080,
        95
    );

    // Bloc Messages

    ctx.font =
        "24px Arial";

// 1 jour
ctx.fillText(
    `${stats.messagesToday || 0} messages`,
    840,
    320
);

// 7 jours
ctx.fillText(
    `${stats.messages7d || 0} messages`,
    840,
    380
);

// 14 jours
ctx.fillText(
    `${stats.messages14d || 0} messages`,
    840,
    440
);

// total
ctx.fillText(
    `${stats.messages || 0}`,
    1160,
    260
);

    return canvas.encode(
        "png"
    );

};
