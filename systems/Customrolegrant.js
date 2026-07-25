const CustomRole = require('../models/CustomRole');

/**
 * Traite une éventuelle commande d'attribution de rôle perso (+nomcommande @personne).
 * Appelé depuis le messageCreate unique d'index.js, APRÈS extraction du prefix/commandName,
 * pour éviter de reparser message.content avec un préfixe différent.
 *
 * @param {Message} message
 * @param {string} commandName - déjà en minuscule, sans le préfixe
 * @returns {Promise<boolean>} true si la commande correspondait à un rôle perso (traitée, qu'elle ait réussi ou échoué),
 *                             false si commandName ne correspond à aucun rôle perso (laisser la suite du routeur gérer).
 */
module.exports = async function handleCustomRoleGrant(message, commandName) {
  if (!message.guild || message.author.bot) return false;
  if (!commandName) return false;

  const customRole = await CustomRole.findOne({ guildId: message.guild.id, commandName });
  if (!customRole) return false; // pas une commande de rôle perso -> laisser passer à la suite

  if (customRole.userId !== message.author.id) {
    await message.reply(`❌ Seul le propriétaire de \`+${commandName}\` peut l'attribuer.`);
    return true;
  }

  const target = message.mentions.members?.first();
  if (!target) {
    await message.reply(`❌ Mentionne quelqu'un : \`+${commandName} @personne\``);
    return true;
  }

  const role = await message.guild.roles.fetch(customRole.roleId).catch(() => null);
  if (!role) {
    await message.reply("❌ Ce rôle perso n'existe plus côté Discord.");
    return true;
  }

  if (target.roles.cache.has(role.id)) {
    await message.reply(`ℹ️ ${target} a déjà ce rôle.`);
    return true;
  }

  await target.roles.add(role).catch(() => null);

  if (!customRole.sharedWith.includes(target.id)) {
    customRole.sharedWith.push(target.id);
    await customRole.save();
  }

  await message.reply(`✅ ${target} a reçu le rôle **${customRole.name}** !`);
  return true;
};
