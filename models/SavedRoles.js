// models/SavedRoles.js

const mongoose =
require("mongoose");

module.exports =
mongoose.model(
    "SavedRoles",
    new mongoose.Schema({
        userId: String,
        roles: [String]
    })
);
