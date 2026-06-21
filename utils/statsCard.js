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
    ctx.fillStyle = "#FF0000";
ctx.font = "100px sans-serif";
ctx.fillText("TEST", 100, 100);

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
        member.username,
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
    member.user?.createdAt
        ? member.user.createdAt.toLocaleDateString("fr-FR")
        : "N/A";

// Date arrivée serveur

const joinedAt =
    member.joinedAt
        ? member.joinedAt.toLocaleDateString("fr-FR")
        : "N/A";
    // Bloc Messages

    ctx.font =
        "40px Arial";

ctx.fillStyle = "#FF0000";
ctx.font = "40px Arial";

ctx.fillText(stats.messages.toString(), 800, 250);
ctx.fillText(stats.messages7d.toString(), 800, 350);
ctx.fillText(stats.messages14d.toString(), 800, 450);

console.log(stats);
ctx.fillStyle = "#FF0000";
ctx.font = "50px Arial";

ctx.fillText("TEST", 600, 300);
return canvas.encode("png");

};
