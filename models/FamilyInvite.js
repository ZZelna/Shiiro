const mongoose = require("mongoose");

module.exports = mongoose.model(
    "FamilyInvite",
    new mongoose.Schema({
        familyId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Family"
        },

        userId: String,

        inviterId: String,

        createdAt: {
            type: Date,
            default: Date.now,
            expires: 300
        }
    })
);
