const mongoose = require("mongoose");

const aiLimitSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    date: {
        type: String,
        required: true
    },
    bigPrompts: {
        type: Number,
        default: 0
    }
});

module.exports = mongoose.model("AiLimit", aiLimitSchema);
