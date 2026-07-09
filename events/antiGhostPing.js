const ghostMentions = new Map();

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

    try {

        const guild = message.client.guilds.cache.get(data.guild);
        const member = await guild.members.fetch(data.author);
        const channel = guild.channels.cache.get(data.channel);

        const users = data.mentions
            .map(id => `<@${id}>`)
            .join(", ");

        const alert = await channel.send({
            content: `👻 ${member} a effectué un ghost ping.\nMentions : ${users}`
        });

        setTimeout(() => {
            alert.delete().catch(() => {});
        }, 5000);

    } catch {}
}
};
