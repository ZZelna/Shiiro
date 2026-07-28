// Palette de couleurs partagée par les panels (/panel, /plugins) pour
// garder une identité visuelle cohérente et distincte entre les deux.
module.exports = {
    panel: {
        enabled: 0x5865F2,   // blurple — module actif
        disabled: 0x99282A   // rouge sombre — module désactivé
    },
    plugins: {
        base: 0xF1C40F,      // or — couleur neutre du gestionnaire de plugins
        enabled: 0x57F287,   // vert Discord — plugin activé
        disabled: 0xED4245   // rouge Discord — plugin désactivé
    }
};
