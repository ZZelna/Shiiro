const mongoose = require("mongoose");

module.exports = mongoose.model(
  "Coffre",
  new mongoose.Schema({
    totalHits: {
      type: Number,
      default: 0
    },
    destroyed: {
      type: Boolean,
      default: false
    },
    participants: {
      type: Map,
      of: new mongoose.Schema({
        hits: { type: Number, default: 0 },
        lastAttack: { type: Number, default: 0 }
      }, { _id: false }),
      default: {}
    }
  })
);
