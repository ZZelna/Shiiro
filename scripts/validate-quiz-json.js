/**
 * Usage : node scripts/validate-quiz-json.js
 * Vérifie chaque fichier de data/quiz/ et affiche précisément
 * le fichier et la ligne qui posent problème.
 */
const fs = require('fs');
const path = require('path');

const QUESTIONS_DIR = path.join(__dirname, '..', 'data', 'quiz');
const REQUIRED_FIELDS = ['id', 'category', 'difficulty', 'points', 'question', 'choices', 'answer', 'explanation'];

if (!fs.existsSync(QUESTIONS_DIR)) {
  console.error(`❌ Dossier introuvable : ${QUESTIONS_DIR}`);
  process.exit(1);
}

const files = fs.readdirSync(QUESTIONS_DIR).filter(f => f.endsWith('.json'));
let hasError = false;
const seenIds = new Map(); // id -> fichier où il a déjà été vu

for (const file of files) {
  const filePath = path.join(QUESTIONS_DIR, file);
  const raw = fs.readFileSync(filePath, 'utf8');

  if (raw.trim().length === 0) {
    console.error(`❌ ${file} : fichier vide`);
    hasError = true;
    continue;
  }

  let content;
  try {
    content = JSON.parse(raw);
  } catch (err) {
    // Essaie de localiser la ligne à partir de la position donnée par l'erreur
    const match = err.message.match(/position (\d+)/);
    let lineInfo = '';
    if (match) {
      const pos = Number(match[1]);
      const line = raw.slice(0, pos).split('\n').length;
      lineInfo = ` (vers la ligne ${line})`;
    }
    console.error(`❌ ${file} : JSON invalide${lineInfo} — ${err.message}`);
    hasError = true;
    continue;
  }

  if (!Array.isArray(content)) {
    console.error(`❌ ${file} : doit être un tableau [...], trouvé un(e) ${typeof content}`);
    hasError = true;
    continue;
  }

  content.forEach((q, i) => {
    const missing = REQUIRED_FIELDS.filter(f => q[f] === undefined);
    if (missing.length) {
      console.error(`❌ ${file} [index ${i}, id ${q.id}] : champ(s) manquant(s) : ${missing.join(', ')}`);
      hasError = true;
    }
    if (Array.isArray(q.choices) && q.choices.length !== 4) {
      console.error(`❌ ${file} [index ${i}, id ${q.id}] : ${q.choices.length} choix au lieu de 4`);
      hasError = true;
    }
    if (typeof q.answer === 'number' && (q.answer < 0 || q.answer > 3)) {
      console.error(`❌ ${file} [index ${i}, id ${q.id}] : answer=${q.answer} hors limites (0-3)`);
      hasError = true;
    }
    if (q.id !== undefined) {
      if (seenIds.has(q.id)) {
        console.error(`❌ ${file} [id ${q.id}] : id en doublon (déjà utilisé dans ${seenIds.get(q.id)})`);
        hasError = true;
      } else {
        seenIds.set(q.id, file);
      }
    }
  });

  if (!hasError) console.log(`✅ ${file} : ${content.length} questions OK`);
}

if (hasError) {
  console.error('\n⚠️  Corrige les erreurs ci-dessus avant de relancer le bot.');
  process.exit(1);
} else {
  console.log(`\n✅ Tous les fichiers sont valides (${files.length} fichiers, ${seenIds.size} questions au total).`);
}
