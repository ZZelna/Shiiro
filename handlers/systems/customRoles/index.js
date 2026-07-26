const list = require("./list");
const search = require("./search");
const stats = require("./stats");
const repair = require("./repair");
const exportRoles = require("./export");
const importRoles = require("./import");
const rename = require("./rename");
const modify = require("./modify");
const transfer = require("./transfer");
const deleteRole = require("./delete");

module.exports = async (interaction) => {

    if (
        !interaction.isButton() &&
        !interaction.isStringSelectMenu() &&
        !interaction.isModalSubmit()
    ) return;

    const id = interaction.customId;

    switch (id) {

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

    if (id === "customroles_select")
        return;

    if (id.startsWith("rename_"))
        return rename(interaction);

    if (id.startsWith("modify_"))
        return modify(interaction);

    if (id.startsWith("transfer_"))
        return transfer(interaction);

    if (id.startsWith("delete_"))
        return deleteRole(interaction);

};
