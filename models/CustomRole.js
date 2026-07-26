const { Schema, model } = require("mongoose");

const customRoleSchema = new Schema({

    guildId: {
        type: String,
        required: true
    },

    userId: {
        type: String,
        required: true
    },

    roleId: {
        type: String,
        required: true
    },

    name: {
        type: String,
        required: true
    },

    color: {
        type: String,
        default: "#5865F2"
    },

    icon: {
        type: String,
        default: null
    },

    commandName: {
        type: String,
        required: true,
        lowercase: true,
        trim: true
    },

    sharedWith: {
        type: [String],
        default: []
    },

    createdAt: {
        type: Date,
        default: Date.now
    },

    updatedAt: {
        type: Date,
        default: Date.now
    }

});

// Un seul rôle personnalisé par utilisateur et par serveur
customRoleSchema.index(
    {
        guildId: 1,
        userId: 1
    },
    {
        unique: true
    }
);

// Une seule commande par serveur
customRoleSchema.index(
    {
        guildId: 1,
        commandName: 1
    },
    {
        unique: true
    }
);

// Un seul rôle Discord enregistré par serveur
customRoleSchema.index(
    {
        guildId: 1,
        roleId: 1
    },
    {
        unique: true
    }
);

// Met automatiquement updatedAt à jour
customRoleSchema.pre("save", function (next) {
    this.updatedAt = new Date();
    next();
});

module.exports = model("CustomRole", customRoleSchema);
