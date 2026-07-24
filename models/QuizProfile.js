const { Schema, model } = require('mongoose');

const quizProfileSchema = new Schema({
  userId: { type: String, required: true },
  guildId: { type: String, required: true },
  xp: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  streak: { type: Number, default: 0 },
  bestStreak: { type: Number, default: 0 },
  questionsAnswered: { type: Number, default: 0 },
  questionsCorrect: { type: Number, default: 0 },
  lastPlayedAt: { type: Date, default: null },
  // Prestige
  prestige: { type: Number, default: 0 }, // 0 = pas encore prestige, 1-10 = palier atteint
  badges: { type: [String], default: [] },
  title: { type: String, default: null },
  frame: { type: String, default: null },
  pendingDrops: { type: Number, default: 0 },
});

// Un profil par joueur et par serveur
quizProfileSchema.index({ userId: 1, guildId: 1 }, { unique: true });

module.exports = model('QuizProfile', quizProfileSchema);
