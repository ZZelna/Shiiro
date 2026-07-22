const fs = require('fs');
const path = require('path');

// Dossier où se trouvent tes fichiers JSON de questions (ex: quiz_art_411_500.json)
const QUESTIONS_DIR = path.join(__dirname, '..', 'data', 'quiz');

let cachedQuestions = null;

/**
 * Charge et met en cache toutes les questions présentes dans data/quiz/*.json
 */
function loadAllQuestions() {
  if (cachedQuestions) return cachedQuestions;

  const files = fs.readdirSync(QUESTIONS_DIR).filter(f => f.endsWith('.json'));
  let all = [];

  for (const file of files) {
    const content = JSON.parse(fs.readFileSync(path.join(QUESTIONS_DIR, file), 'utf8'));
    all = all.concat(content);
  }

  cachedQuestions = all;
  return all;
}

/**
 * Tire une question au hasard, avec filtres optionnels (category, difficulty)
 */
function pickQuestion({ category = null, difficulty = null } = {}) {
  const pool = loadAllQuestions().filter(q =>
    (!category || q.category.toLowerCase() === category.toLowerCase()) &&
    (!difficulty || q.difficulty === difficulty)
  );

  if (pool.length === 0) return null;
  return pool[Math.floor(Math.random() * pool.length)];
}

/**
 * XP gagné pour une bonne réponse : points de la question + bonus de streak
 */
function computeXpGain(question, streak) {
  const streakBonus = Math.min(streak, 10) * 2; // +2 xp par palier de streak, plafonné
  return question.points + streakBonus;
}

/**
 * Seuil d'XP cumulé nécessaire pour atteindre un niveau donné (courbe simple n²)
 */
function xpForLevel(level) {
  return 50 * level * level;
}

/**
 * Déduit le niveau courant à partir de l'XP total
 */
function levelFromXp(xp) {
  let level = 1;
  while (xpForLevel(level + 1) <= xp) level++;
  return level;
}

module.exports = { loadAllQuestions, pickQuestion, computeXpGain, xpForLevel, levelFromXp };
