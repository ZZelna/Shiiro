const mongoose = require("mongoose");

module.exports = mongoose.model(
  "CasinoProfile",
  new mongoose.Schema({
    userId: String,
    yens: {
      type: Number,
      default: 1000
    },
    gifts: {
      type: Number,
      default: 0
    },
    boostMultiplier: {
      type: Number,
      default: 1
    },
    boostEnd: {
      type: Date,
      default: null
    },
    lastDaily: {
      type: Date,
      default: null
    },
    lastClaim: {
      type: Number,
      default: 0
    },
    dailyBet: {
      type: Number,
      default: 0
    },
lastRob: {
      type: Number,
      default: 0
    }
  })
);
