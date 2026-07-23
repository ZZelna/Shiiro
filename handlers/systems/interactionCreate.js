const confessionHandler = require("../../events/confession");
const handleTicketInteraction = require("./ticketHandler");
const handleCasinoInteraction = require("./casinoHandler");
const handleClanInteraction = require("./clanHandler");
const handleCustomRoleInteraction = require("./customRoleHandler");
const handleCasinoHelpInteraction = require("./casinoHelpHandler");
const handleSurveyInteraction = require("./surveyHandler");
const handleGiveawayInteraction = require("./giveawayHandler");
const handlePingInteraction = require("./pingHandler"); // 👈 AJOUT

module.exports = async (interaction) => {
    // =========================
    // CONFESSIONS
    // =========================
    await confessionHandler(interaction);

    // =========================
    // TICKETS (panel, claim, close+confirmation, delete...)
    // =========================
    await handleTicketInteraction(interaction);

    // =========================
    // CASINO (profil, gifts, boutique, bounty)
    // =========================
    await handleCasinoInteraction(interaction);

    // =========================
    // CLANS
    // =========================
    await handleClanInteraction(interaction);

    // =========================
    // RÔLES PERSONNALISÉS
    // =========================
    await handleCustomRoleInteraction(interaction);

    // =========================
    // AIDE CASINO (pagination)
    // =========================
    await handleCasinoHelpInteraction(interaction);

    // =========================
    // SONDAGES
    // =========================
    await handleSurveyInteraction(interaction);

    // =========================
    // GIVEAWAYS
    // =========================
    await handleGiveawayInteraction(interaction);

    // =========================
    // PINGS (choix des rôles de notif)
    // =========================
    await handlePingInteraction(interaction); // 👈 AJOUT
};
