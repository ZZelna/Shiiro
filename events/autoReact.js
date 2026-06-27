module.exports = async (message) => {

    if (message.author.bot) return;

if (message.channel.id !== "1507005677485428927") return;

    try {
        await message.react("1507449720673669261");
        await message.react("1507449719343808542");
          } catch {}

};
