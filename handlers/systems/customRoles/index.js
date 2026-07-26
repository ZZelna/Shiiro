const create = require("./create");
const remove = require("./delete");
const rename = require("./rename");
const modify = require("./modify");
const transfer = require("./transfer");
const share = require("./share");
const unshare = require("./unshare");

const list = require("./list");
const search = require("./search");
const stats = require("./stats");
const repair = require("./repair");
const exportRoles = require("./export");
const importRoles = require("./import");

module.exports = async interaction => {

    if (
        !interaction.isButton() &&
        !interaction.isStringSelectMenu() &&
        !interaction.isModalSubmit()
    ) return;

    const id = interaction.customId;

    /* ===========================
       PANNEAU PRINCIPAL
    =========================== */

    switch (id) {

        case "customrole_create":
            return create(interaction);

        case "customrole_delete":
            return remove(interaction);

        case "customroles_list":
            return list(interaction);

        case "customroles_search":
            return search(interaction);

        case "customroles_stats":
            return stats(interaction);

        case "customroles_repair":
            return repair(interaction);

        case "customroles_export":
            return exportRoles(interaction);

        case "customroles_import":
            return importRoles(interaction);

    }

    /* ===========================
       MENUS DÉROULANTS
    =========================== */

    if (id === "customroles_select")
        return list(interaction);

    if (id === "customroles_delete_select")
        return remove(interaction);

    if (id === "customroles_transfer_select")
        return transfer(interaction);

    if (id === "customroles_share_select")
        return share(interaction);

    if (id === "customroles_unshare_select")
        return unshare(interaction);

    /* ===========================
       MODALS
    =========================== */

    if (id === "customrole_modal")
        return create(interaction);

    if (id.startsWith("rename_modal_"))
        return rename(interaction);

    if (id.startsWith("modify_modal_"))
        return modify(interaction);

    if (id.startsWith("transfer_modal_"))
        return transfer(interaction);

    /* ===========================
       BOUTONS
    =========================== */

    if (id.startsWith("rename_"))
        return rename(interaction);

    if (id.startsWith("modify_"))
        return modify(interaction);

    if (id.startsWith("transfer_"))
        return transfer(interaction);

    if (id.startsWith("delete_"))
        return remove(interaction);

    if (id.startsWith("share_"))
        return share(interaction);

    if (id.startsWith("unshare_"))
        return unshare(interaction);

};
