const bypassData = require("./data/bypass.json");

module.exports = async (member) => {
    
    if (bypassData.users.includes(member.id)) {
    return;
}

    const sevenDays = 7 * 24 * 60 * 60 * 1000;

    const accountAge =
        Date.now() - member.user.createdTimestamp;

    if (accountAge < sevenDays) {

        try {
            await member.send(
                `Coucou ${member},

Tu as été banni automatiquement de Shiiiro car ton compte est trop récent.

Pour demander un bypass, rejoins ce serveur et ouvre un ticket :

https://discord.gg/shiiro`
            );
        } catch (err) {}

        await member.ban({
            reason: "Compte de moins de 7 jours."
        });
    }
};
