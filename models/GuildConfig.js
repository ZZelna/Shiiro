const { Schema, model } = require("mongoose");

const guildConfigSchema = new Schema({
    guildId: {
        type: String,
        required: true,
        unique: true
    },

    version: {
        type: Number,
        default: 1
    },

    plugins: {

        // ───────────────────────────────
        // CASINO
        // ───────────────────────────────
        casino: {

            enabled: {
                type: Boolean,
                default: true
            },

            channels: {
                main: String,
                logs: String,
                shop: String,
                wins: String
            },

            roles: {
                admin: String,
                staff: String
            },

            settings: {
                currency: {
                    type: String,
                    default: "¥"
                },

                maxBet: {
                    type: Number,
                    default: 100000
                },

                cooldown: {
                    type: Number,
                    default: 60
                }
            }
        },

        // ───────────────────────────────
        // QUIZ
        // ───────────────────────────────
        quiz: {

            enabled: {
                type: Boolean,
                default: true
            },

            channels: {
                solo: String,
                duel: String,
                duo2v2: String,
                battleRoyale: String,
                tournoi: String,
                classeVsClasse: String,
                bossHebdo: String,
                marathon: String
            }
        },

        // ───────────────────────────────
        // PROGRESSION
        // ───────────────────────────────
        progression: {

            enabled: {
                type: Boolean,
                default: true
            },

            channels: {
                profil: String,
                succes: String,
                collections: String,
                boutique: String,
                inventaire: String
            }
        },

        // ───────────────────────────────
        // INFORMATIONS
        // ───────────────────────────────
        informations: {

            enabled: {
                type: Boolean,
                default: true
            },

            channels: {
                classements: String,
                xpEtNiveaux: String,
                misesAJour: String,
                evenements: String
            }
        },

        // ───────────────────────────────
        // TICKETS
        // ───────────────────────────────
        tickets: {

            enabled: {
                type: Boolean,
                default: true
            },

            category: String,

            channels: {
                logs: String,
                transcripts: String
            },

            roles: {
                support: String
            }
        },

        // ───────────────────────────────
        // MODÉRATION
        // ───────────────────────────────
        moderation: {

            enabled: {
                type: Boolean,
                default: true
            },

            channels: {
                logs: String,
                reports: String
            },

            roles: {
                admin: String,
                moderator: String
            }
        },

        // ───────────────────────────────
        // GIVEAWAYS
        // ───────────────────────────────
        giveaways: {

            enabled: {
                type: Boolean,
                default: true
            },

            channels: {
                main: String
            },

            roles: {
                manager: String
            }
        },

        // ───────────────────────────────
        // WELCOME
        // ───────────────────────────────
        welcome: {

            enabled: {
                type: Boolean,
                default: true
            },

            channels: {
                welcome: String,
                goodbye: String
            }
        },

        // ───────────────────────────────
        // CUSTOM ROLES
        // ───────────────────────────────
        customRoles: {

            enabled: {
                type: Boolean,
                default: true
            },

            unlockRole: String,

            topRole: String,

            bottomRole: String
        }
    }

}, {
    timestamps: true
});

module.exports = model("GuildConfig", guildConfigSchema);
