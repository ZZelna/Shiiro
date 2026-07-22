const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, AttachmentBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const QUESTIONS_DIR = path.join(__dirname, '..', 'data', 'quiz');
const REQUIRED_FIELDS = ['id', 'category', 'difficulty', 'points', 'question', 'choices', 'answer'];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('validatequiz')
    .setDescription("Vérifie tous les fichiers JSON de data/quiz/ et signale les erreurs")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    if (!fs.existsSync(QUESTIONS_DIR)) {
      return interaction.editReply(`❌ Dossier introuvable : \`${QUESTIONS_DIR}\``);
    }

    const files = fs.readdirSync(QUESTIONS_DIR).filter(f => f.endsWith('.json'));
    const lines = [];
    let errorCount = 0;
    let totalQuestions = 0;

    for (const file of files) {
      const filePath = path.join(QUESTIONS_DIR, file);
      const raw = fs.readFileSync(filePath, 'utf8');

      if (raw.trim().length === 0) {
        lines.push(`❌ ${file} : fichier vide`);
        errorCount++;
        continue;
      }

      let content;
      try {
        content = JSON.parse(raw);
      } catch (err) {
        const match = err.message.match(/position (\d+)/);
        let lineInfo = '';
        if (match) {
          const pos = Number(match[1]);
          const line = raw.slice(0, pos).split('\n').length;
          lineInfo = ` (vers la ligne ${line})`;
        }
        lines.push(`❌ ${file} : JSON invalide${lineInfo} — ${err.message}`);
        errorCount++;
        continue;
      }

      if (!Array.isArray(content)) {
        lines.push(`❌ ${file} : doit être un tableau [...], trouvé un(e) ${typeof content}`);
        errorCount++;
        continue;
      }

      let fileHasError = false;
      const seenIdsInFile = new Map(); // doublon = même id ET même question, dans CE fichier
      content.forEach((q, i) => {
        const missing = REQUIRED_FIELDS.filter(f => q[f] === undefined);
        if (missing.length) {
          lines.push(`❌ ${file} [index ${i}, id ${q.id}] : champ(s) manquant(s) : ${missing.join(', ')}`);
          errorCount++; fileHasError = true;
        }
        if (Array.isArray(q.choices) && q.choices.length !== 4) {
          lines.push(`❌ ${file} [index ${i}, id ${q.id}] : ${q.choices.length} choix au lieu de 4`);
          errorCount++; fileHasError = true;
        }
        if (typeof q.answer === 'number' && (q.answer < 0 || q.answer > 3)) {
          lines.push(`❌ ${file} [index ${i}, id ${q.id}] : answer=${q.answer} hors limites (0-3)`);
          errorCount++; fileHasError = true;
        }
        if (q.id !== undefined) {
          const dupKey = `${q.id}::${q.question}`;
          if (seenIdsInFile.has(dupKey)) {
            lines.push(`❌ ${file} [id ${q.id}] : question dupliquée dans ce fichier`);
            errorCount++; fileHasError = true;
          } else {
            seenIdsInFile.set(dupKey, true);
          }
        }
      });

      totalQuestions += content.length;
      if (!fileHasError) lines.push(`✅ ${file} : ${content.length} questions OK`);
    }

    const summary = `**${files.length}** fichiers scannés • **${totalQuestions}** questions • **${errorCount}** erreur(s)`;
    const fullReport = lines.join('\n');

    const embed = new EmbedBuilder()
      .setColor(errorCount ? 0xED4245 : 0x57F287)
      .setTitle('🔍 Validation des fichiers de quiz')
      .setDescription(summary);

    // Si le rapport est trop long pour un embed, on l'envoie en pièce jointe
    if (fullReport.length > 3500) {
      const attachment = new AttachmentBuilder(Buffer.from(fullReport, 'utf8'), { name: 'rapport-validation.txt' });
      return interaction.editReply({ embeds: [embed], files: [attachment] });
    }

    embed.addFields({ name: 'Détail', value: '```' + fullReport.slice(0, 1000) + '```' });
    await interaction.editReply({ embeds: [embed] });
  },
};
