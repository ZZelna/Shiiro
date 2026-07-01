const mongoose = require("mongoose");

module.exports = mongoose.model(
    "AutoRole",
    new mongoose.Schema({
        guildId: String,
        roleId: String
    })
);
