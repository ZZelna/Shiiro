const { SlashCommandBuilder, AttachmentBuilder } = require("discord.js");
const { createCanvas, loadImage, GlobalFonts } = require("@napi-rs/canvas");

// ─── Thèmes de dégradé (sous-ensemble de ceux vus dans Make it a Quote) ──────
const THEMES = {
    noir_blanc: { colors: ["#000000", "#000000"], text: "#FFFFFF", sub: "#AAAAAA" },
    sunset: { colors: ["#FF7E5F", "#3B1E54"], text: "#FFFFFF", sub: "#EADFD9" },
    midnight_blurple: { colors: ["#1E1B4B", "#3B3486"], text: "#FFFFFF", sub: "#C7C3E8" },
    crimson_moon: { colors: ["#2B0000", "#8B0000"], text: "#FFFFFF", sub: "#E8B4B4" },
    forest: { colors: ["#0B3D0B", "#3E8E41"], text: "#FFFFFF", sub: "#D5F0D5" },
    sepia: { colors: ["#3B2A1A", "#8B6B3D"], text: "#FFF6E5", sub: "#E0C9A6" }
};

// ─── Découpe le texte en lignes selon la largeur max disponible ──────────────
function wrapText(ctx, text, maxWidth) {
    const words = text.split(" ");
    const lines = [];
    let currentLine = "";

    for (const word of words) {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        if (ctx.measureText(testLine).width > maxWidth && currentLine) {
            lines.push(currentLine);
            currentLine = word;
        } else {
            currentLine = testLine;
        }
    }
    if (currentLine) lines.push(currentLine);
    return lines;
}

// ─── Convertit une image en niveaux de gris (pixel par pixel) ───────────────
function toGrayscale(ctx, x, y, width, height) {
    const imageData = ctx.getImageData(x, y, width, height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
        const gray = data[i] * 0.3 + data[i + 1] * 0.59 + data[i + 2] * 0.11;
        data[i] = gray;
        data[i + 1] = gray;
        data[i + 2] = gray;
    }

    ctx.putImageData(imageData, x, y);
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName("quote")
        .setDescription("Génère une image citation stylisée")
        .addStringOption(option =>
            option
                .setName("texte")
                .setDescription("Le texte de la citation")
                .setRequired(true)
                .setMaxLength(300)
        )
        .addUserOption(option =>
            option
                .setName("auteur")
                .setDescription("Auteur de la citation (par défaut : toi)")
                .setRequired(false)
        )
        .addStringOption(option =>
            option
                .setName("theme")
                .setDescription("Thème de couleur")
                .setRequired(false)
                .addChoices(
                    { name: "Noir et blanc (défaut)", value: "noir_blanc" },
                    { name: "Sunset", value: "sunset" },
                    { name: "Midnight Blurple", value: "midnight_blurple" },
                    { name: "Crimson Moon", value: "crimson_moon" },
                    { name: "Forest", value: "forest" },
                    { name: "Sepia", value: "sepia" }
                )
        ),

    async execute(interaction) {

        await interaction.deferReply();

        const text = interaction.options.getString("texte");
        const author = interaction.options.getUser("auteur") || interaction.user;
        const themeKey = interaction.options.getString("theme") || "noir_blanc";
        const theme = THEMES[themeKey];

        const member = await interaction.guild.members.fetch(author.id).catch(() => null);
        const displayName = member?.displayName || author.username;

        // ─── Dimensions du canvas ─────────────────────────────────────────────
        const WIDTH = 1000;
        const HEIGHT = 420;
        const AVATAR_WIDTH = 380;

        const canvas = createCanvas(WIDTH, HEIGHT);
        const ctx = canvas.getContext("2d");

        // ─── Fond dégradé (partie texte, à droite) ───────────────────────────
        const gradient = ctx.createLinearGradient(AVATAR_WIDTH, 0, WIDTH, HEIGHT);
        gradient.addColorStop(0, theme.colors[0]);
        gradient.addColorStop(1, theme.colors[1]);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, WIDTH, HEIGHT);

        // ─── Avatar en niveaux de gris à gauche ──────────────────────────────
        try {
            const avatarURL = author.displayAvatarURL({ extension: "png", size: 512 });
            const avatarImage = await loadImage(avatarURL);

            // Recadrage "cover" pour remplir la zone avatar sans déformation
            const scale = Math.max(AVATAR_WIDTH / avatarImage.width, HEIGHT / avatarImage.height);
            const drawWidth = avatarImage.width * scale;
            const drawHeight = avatarImage.height * scale;
            const offsetX = (AVATAR_WIDTH - drawWidth) / 2;
            const offsetY = (HEIGHT - drawHeight) / 2;

            ctx.save();
            ctx.beginPath();
            ctx.rect(0, 0, AVATAR_WIDTH, HEIGHT);
            ctx.clip();
            ctx.drawImage(avatarImage, offsetX, offsetY, drawWidth, drawHeight);
            ctx.restore();

            if (themeKey === "noir_blanc") {
                toGrayscale(ctx, 0, 0, AVATAR_WIDTH, HEIGHT);
            }
        } catch (err) {
            console.error("❌ Erreur chargement avatar /quote :", err);
            ctx.fillStyle = "#333333";
            ctx.fillRect(0, 0, AVATAR_WIDTH, HEIGHT);
        }

        // ─── Fondu entre l'avatar et le fond (dégradé de transition) ─────────
        const fadeWidth = 140;
        const fade = ctx.createLinearGradient(AVATAR_WIDTH - fadeWidth, 0, AVATAR_WIDTH + 20, 0);
        fade.addColorStop(0, "rgba(0,0,0,0)");
        fade.addColorStop(1, theme.colors[0]);
        ctx.fillStyle = fade;
        ctx.fillRect(AVATAR_WIDTH - fadeWidth, 0, fadeWidth + 20, HEIGHT);

        // ─── Texte de la citation (auto-fit) ──────────────────────────────────
        const textX = AVATAR_WIDTH + 40;
        const textMaxWidth = WIDTH - textX - 40;

        let fontSize = 40;
        let lines = [];

        do {
            ctx.font = `bold ${fontSize}px sans-serif`;
            lines = wrapText(ctx, `“${text}”`, textMaxWidth);
            fontSize -= 2;
        } while (lines.length * (fontSize + 12) > HEIGHT - 140 && fontSize > 16);

        ctx.fillStyle = theme.text;
        ctx.textBaseline = "middle";

        const lineHeight = fontSize + 14;
        const totalTextHeight = lines.length * lineHeight;
        let startY = (HEIGHT - totalTextHeight) / 2 - 20;

        for (const line of lines) {
            ctx.fillText(line, textX, startY + lineHeight / 2);
            startY += lineHeight;
        }

        // ─── Nom de l'auteur + pseudo ─────────────────────────────────────────
        ctx.font = "italic 22px sans-serif";
        ctx.fillStyle = theme.text;
        ctx.fillText(`- ${displayName}`, textX, startY + 30);

        ctx.font = "16px sans-serif";
        ctx.fillStyle = theme.sub;
        ctx.fillText(`@${author.username}`, textX, startY + 58);

        // ─── Filigrane discret en bas à droite ────────────────────────────────
        ctx.font = "13px sans-serif";
        ctx.fillStyle = "rgba(255,255,255,0.35)";
        ctx.textAlign = "right";
        ctx.fillText(`Shiiro Quote`, WIDTH - 15, HEIGHT - 15);
        ctx.textAlign = "left";

        const buffer = canvas.toBuffer("image/png");
        const attachment = new AttachmentBuilder(buffer, { name: "quote.png" });

        await interaction.editReply({ files: [attachment] });
    }
};
