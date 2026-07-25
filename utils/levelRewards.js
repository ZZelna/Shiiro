/**
 * Contenu réel des récompenses de niveaux.
 * REMPLIS les valeurs vides ("") avec tes vrais textes — laisse "" pour garder
 * le texte générique de secours ("Niveau X") tant que tu n'as pas décidé.
 */

// Tous les 10 niveaux : badge + titre
const LEVEL_BADGES = {
  10: { emoji: '', badge: '', title: '' },
  20: { emoji: '', badge: '', title: '' },
  30: { emoji: '', badge: '', title: '' },
  40: { emoji: '', badge: '', title: '' },
  50: { emoji: '', badge: '', title: '' },
  60: { emoji: '', badge: '', title: '' },
  70: { emoji: '', badge: '', title: '' },
  80: { emoji: '', badge: '', title: '' },
  90: { emoji: '', badge: '', title: '' },
  100: { emoji: '🏆', badge: '', title: '' }, // niveau 100 = spécial, voir applyLevelMilestones
};

// Tous les 25 niveaux : cadre de profil + récompense exclusive
const LEVEL_FRAMES = {
  25: { frame: '', extra: '' },
  50: { frame: '', extra: '' },
  75: { frame: '', extra: '' },
  100: { frame: '', extra: '' },
};

// Tous les 50 niveaux : collection + bonus spécial
const LEVEL_COLLECTIONS = {
  50: { collection: '', bonus: '' },
  100: { collection: '', bonus: '' },
};

// Montant de Yens tous les 5 niveaux — formule par défaut si non précisé ci-dessous
const LEVEL_YENS_OVERRIDE = {
  // ex: 25: 10000,  // pour donner un montant précis à un niveau donné plutôt que la formule
};

function getLevelBadge(level) {
  return LEVEL_BADGES[level] ?? null;
}

function getLevelFrame(level) {
  return LEVEL_FRAMES[level] ?? null;
}

function getLevelCollection(level) {
  return LEVEL_COLLECTIONS[level] ?? null;
}

function getLevelYens(level) {
  if (LEVEL_YENS_OVERRIDE[level] !== undefined) return LEVEL_YENS_OVERRIDE[level];
  return (level / 5) * 1000; // formule par défaut
}

module.exports = {
  LEVEL_BADGES, LEVEL_FRAMES, LEVEL_COLLECTIONS, LEVEL_YENS_OVERRIDE,
  getLevelBadge, getLevelFrame, getLevelCollection, getLevelYens,
};
