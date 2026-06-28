const ghostMentions = new Map();
const ghostCounts = new Map();

module.exports = {

   messageCreate(message) {

       if (message.author.bot) return;

       if (message.mentions.users.size === 0)
           return;

       ghostMentions.set(message.id, {

           author: message.author.id,

           mentions: [...message.mentions.users.keys()],

           channel: message.channel.id,

           guild: message.guild.id

       });

   },

   async messageDelete(message) {

       if (!ghostMentions.has(message.id))
           return;

       const data = ghostMentions.get(message.id);

       ghostMentions.delete(message.id);

       if (data.mentions.length < 5) return;

       const count = (ghostCounts.get(data.author) || 0) + 1;

       ghostCounts.set(data.author, count);

       if (count < 5) return;

       ghostCounts.set(data.author, 0);

       try {

           const guild =
               message.client.guilds.cache.get(
                   data.guild
               );

           const member =
               await guild.members.fetch(
                   data.author
               );

           const channel =
               guild.channels.cache.get(
                   data.channel
               );

           const users =
               data.mentions
                   .map(id => `<@${id}>`)
                   .join(", ");

           const warn =
               await channel.send({

                   content:
                       `👻 ${member} Ghost Ping en masse détecté (5 fois).\nMentions : ${users}`

               });

           setTimeout(() => {

               warn.delete().catch(() => {});

           }, 5000);

       } catch {}

   }

};
