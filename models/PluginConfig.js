const mongoose = require("mongoose");

// Une seule config par guilde : une Map plugin -> activé/désactivé.
const PluginConfigSchema = new mongoose.Schema({
    guildId: { type: String, required: true, unique: true },
    plugins: {
        type: Map,
        of: Boolean,
        default: {}
    }
});

module.exports = mongoose.model("PluginConfig", PluginConfigSchema);
