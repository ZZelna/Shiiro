module.exports = async (message) => {

    if (message.author.bot) return;

    // ID du salon
    if (message.channel.id !== "1507005677485428927") return;

    // Si le message contient une image, vidéo ou autre fichier → autorisé
    if (message.attachments.size > 0) return;

    try {

        await message.delete();

        const warn = await message.channel.send({
            content: `⚠️ ${message.author}, seuls les **photos et vidéos** sont autorisées ici.`
        });

        setTimeout(() => {
            warn.delete().catch(() => {});
        }, 5000);

    } catch {}

};
